import { task } from "@trigger.dev/sdk";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { z } from "zod";
import { LiveMap, LiveObject, LiveList } from "@liveblocks/node";
import { liveblocks } from "@/lib/liveblocks";
import { NODE_COLORS } from "@/types/canvas";

export const designTask = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string; projectId: string }) => {
    console.log("Design task started:", payload);

    const broadcastStatus = async (text: string, status: "start" | "processing" | "complete" | "error", active = true) => {
      if (!liveblocks) {
        console.warn("Liveblocks client missing, skipping broadcastStatus");
        return;
      }
      await liveblocks.broadcastEvent(payload.roomId, {
        type: "ai-status",
        text,
        active,
        senderId: "ai-agent",
      });
    };

    try {
      // 1. Initial status
      await broadcastStatus("AI Architect is thinking...", "start", true);

      // 2. Fetch current storage for context
      await broadcastStatus("Analyzing canvas context...", "processing", true);

      // Verify Liveblocks Room Existence and CLEAR IT for a fresh design
      try {
        if (!liveblocks) {
          throw new Error("LIVEBLOCKS_SECRET_KEY is required for this task");
        }
        const room = await liveblocks!.getRoom(payload.roomId);
        console.log(`Liveblocks Room verified: ${room.id}`);
        
        // Force a total reset of the storage keys for nodes and edges
        await liveblocks!.mutateStorage(payload.roomId, ({ root }: { root: any }) => {
          let nodes = root.get("nodes");
          if (!nodes) {
            root.set("nodes", new LiveMap());
            nodes = root.get("nodes");
          }

          let edges = root.get("edges");
          if (!edges) {
            root.set("edges", new LiveMap());
            edges = root.get("edges");
          }

          if (nodes) {
            // Defensive clear: some environments might not support .clear()
            if (typeof nodes.clear === "function") {
              nodes.clear();
            } else {
              for (const key of Array.from(nodes.keys())) {
                nodes.delete(key);
              }
            }
          }

          if (edges) {
            if (typeof edges.clear === "function") {
              edges.clear();
            } else {
              for (const key of Array.from(edges.keys())) {
                edges.delete(key);
              }
            }
          }
          
          // Clean up old flow object if it exists to prevent confusion
          root.delete("flow");
          console.log("Storage: root level maps cleared for fresh design");
        });

        // 2b. Re-verify storage state immediately after clearing (diagnostic)
        const storageAfterClear = await liveblocks!.getStorageDocument(payload.roomId, "json");
        console.log(`Diagnostic: Room storage after clear mutation: ${JSON.stringify(storageAfterClear)}`);
      } catch (e: any) {
        if (e.status === 404) {
          console.warn(`Room ${payload.roomId} not found in Liveblocks. Creating...`);
          await liveblocks!.createRoom(payload.roomId, { defaultAccesses: [] });
        } else {
          console.error(`Error verifying Liveblocks room:`, e);
          throw e; // Rethrow other errors
        }
      }
      
      // 3. Generate design with OpenRouter using tools
      await broadcastStatus("Generating design components...", "processing", true);

      const openrouter = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        headers: {
          "HTTP-Referer": "https://bright-ai.vercel.app",
          "X-Title": "Bright AI",
        },
      });

      const createdNodeIds = new Set<string>();
      
      const { steps, text: finalText } = await generateText({
        model: openrouter("openai/gpt-4o-mini"),
        experimental_telemetry: {
          isEnabled: true,
          functionId: "design-agent-generate-text",
        },
        abortSignal: AbortSignal.timeout(180000), // 180s timeout
        maxSteps: 10,
        maxTokens: 2000,
        toolChoice: "required",
        onStepFinish: ({ text, toolCalls, toolResults, finishReason }: any) => {
           // IDE-safe logging to avoid triggering SQL inspections
           const msg = `Step finished. Reason: ${finishReason}, Text: ${text?.slice(0, 100) || "none"}... Tool calls: ${toolCalls?.length || 0}`;
           console.log(msg);
           if (toolCalls && toolCalls.length > 0) {
             toolCalls.forEach((tc: any) => {
               console.log(`  - Tool call: ${tc.toolName} (ID: ${tc.toolCallId})`);
               const args = tc.args || (tc as any).input;
               console.log(`    Args type: ${typeof args}`);
               console.log(`    Args keys: ${args ? Object.keys(args).join(', ') : 'none'}`);
               console.log(`    Args: ${JSON.stringify(args)}`);
               
               // If args and input are empty or undefined, log the full toolCall object
               if ((!tc.args || Object.keys(tc.args).length === 0) && (!(tc as any).input || Object.keys((tc as any).input).length === 0)) {
                 console.log(`    FULL TOOL CALL OBJECT: ${JSON.stringify(tc)}`);
               }
             });
           }
           if (toolResults && toolResults.length > 0) {
              console.log(`  - Tool results: ${toolResults.length}`);
              toolResults.forEach((tr: any) => {
                console.log(`    Result for ${tr.toolName}: ${JSON.stringify(tr.result)}`);
              });
           }
        },
        maxRetries: 3,
        system: `You are an AI design architect specializing in system diagrams and technical workflows. Your goal is to design complete, robust system architectures by calling the provided tools.
        
        CRITICAL: Every tool call MUST include all required arguments specified in the tool's schema. You MUST follow the JSON schema for each tool call exactly.
        
        IMPORTANT: If you need to add a node, YOU MUST provide 'id', 'position' (x, y), and 'data' (label, shape). DO NOT omit any of these.
        
        Workflow:
        1. Plan the architecture in your head.
        2. Call BOTH 'addNode' for EVERY component and 'addEdge' for EVERY connection in the system. 
        3. Use parallel tool calling to add all nodes and edges in your VERY FIRST response.
        4. YOU MUST ensure all nodes mentioned in edges are created in the same turn.
        5. Call 'finishDesign' when the diagram is complete.
        
        Rules:
        - Use ONLY these shapes: rectangle, diamond, circle, pill, cylinder, hexagon.
        - Use colors ONLY from this palette: ${NODE_COLORS.map(c => c.fill).join(", ")}.
        - Ensure good layout spacing (at least 300px between nodes).
        - Root nodes should be at top/left and flow downwards/rightwards.
        - You can call multiple tools at once (parallel tool calling).
        - Generate a meaningful diagram that follows best practices for system architecture and UI flows.`,
        prompt: `Create a detailed system architecture diagram for: "${payload.prompt}". 
        
        Requirements:
        1. Create a complex architecture (8-10 nodes and 10-15 edges).
        2. Call BOTH 'addNode' and 'addEdge' for all components in your VERY FIRST response using parallel tool calls.
        3. Use different shapes and colors for different types of components.
        4. Call 'finishDesign' after all nodes AND edges are added.`,
        tools: {
          addNode: tool({
            description: "Add a new node to the canvas. Parameters: id (string), position (object with x, y numbers), data (object with label string, shape enum, optional colors and dimensions).",
            inputSchema: z.object({
              id: z.string(),
              position: z.object({
                x: z.number(),
                y: z.number(),
              }),
              data: z.object({
                label: z.string(),
                shape: z.enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"]),
                color: z.string().optional(),
                textColor: z.string().optional(),
                width: z.number().optional(),
                height: z.number().optional(),
              }),
            }),
            execute: async (args, { toolCallId }) => {
              console.log(`AI executing addNode [${toolCallId}]:`, args.id);
              if (!args.id || !args.position || !args.data) {
                console.error(`addNode [${toolCallId}] missing arguments:`, JSON.stringify(args));
                return { success: false, error: "Missing required arguments for addNode." };
              }
              createdNodeIds.add(args.id);
              return { success: true, message: `Node '${args.id}' added. Please continue adding more nodes or connect them with 'addEdge'.` };
            },
          }),
          moveNode: tool({
            description: "Move an existing node. Parameters: id (string), position (object with x, y numbers).",
            inputSchema: z.object({
              id: z.string(),
              position: z.object({
                x: z.number(),
                y: z.number(),
              }),
            }),
            execute: async (args) => {
              console.log("AI executing moveNode:", args.id);
              if (!args.id || !args.position) {
                return { success: false, error: "Missing required arguments for moveNode." };
              }
              return { success: true };
            },
          }),
          resizeNode: tool({
            description: "Resize an existing node. Parameters: id (string), width (number), height (number).",
            inputSchema: z.object({
              id: z.string(),
              width: z.number(),
              height: z.number(),
            }),
            execute: async (args) => {
              console.log("AI executing resizeNode:", args.id);
              if (!args.id || args.width === undefined || args.height === undefined) {
                return { success: false, error: "Missing required arguments for resizeNode." };
              }
              return { success: true };
            },
          }),
          updateNodeData: tool({
            description: "Update the data of an existing node. Parameters: id (string), data (object with optional label, shape, colors).",
            inputSchema: z.object({
              id: z.string(),
              data: z.object({
                label: z.string().optional(),
                shape: z.enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"]).optional(),
                color: z.string().optional(),
                textColor: z.string().optional(),
              }),
            }),
            execute: async (args) => {
              console.log("AI executing updateNodeData:", args.id);
              if (!args.id || !args.data) {
                return { success: false, error: "Missing required arguments for updateNodeData." };
              }
              return { success: true };
            },
          }),
          deleteNode: tool({
            description: "Delete a node from the canvas. Parameters: id (string).",
            inputSchema: z.object({
              id: z.string(),
            }),
            execute: async (args) => {
              console.log("AI executing deleteNode:", args.id);
              if (!args.id) {
                return { success: false, error: "Missing required arguments for deleteNode." };
              }
              return { success: true };
            },
          }),
          addEdge: tool({
            description: "Add a connection between two nodes. Parameters: id (string), source (string node id), target (string node id), optional label (string).",
            inputSchema: z.object({
              id: z.string(),
              source: z.string(),
              target: z.string(),
              label: z.string().optional(),
            }),
            execute: async (args) => {
              console.log("AI executing addEdge:", args.id);
              if (!args.id || !args.source || !args.target) {
                return { success: false, error: "Missing required arguments for addEdge." };
              }
              return { success: true, message: `Edge '${args.id}' added.` };
            },
          }),
          deleteEdge: tool({
            description: "Delete an edge from the canvas. Parameters: id (string).",
            inputSchema: z.object({
              id: z.string(),
            }),
            execute: async (args) => {
              console.log("AI executing deleteEdge:", args.id);
              if (!args.id) {
                return { success: false, error: "Missing required arguments for deleteEdge." };
              }
              return { success: true };
            },
          }),
          finishDesign: tool({
            description: "Call this when the diagram is complete. Parameters: summary (string).",
            inputSchema: z.object({
              summary: z.string(),
            }),
            execute: async (args) => {
              console.log("AI executing finishDesign:", args.summary);
              if (!args.summary) {
                return { success: false, error: "Missing required arguments for finishDesign." };
              }
              return { success: true };
            },
          }),
        },
      } as any);

      await broadcastStatus("Applying changes to canvas...", "processing", true);

      // 4. Apply changes to Liveblocks storage based on tool calls
      let nodesCreated = 0;
      let edgesCreated = 0;

      console.log(`Liveblocks mutateStorage called for room: ${payload.roomId}`);
      try {
        await liveblocks!.mutateStorage(payload.roomId, ({ root }: { root: any }) => {
          console.log("Inside mutateStorage callback");
          
          let nodes = root.get("nodes");
          if (!nodes) {
            console.log("Storage: 'nodes' missing, creating...");
            root.set("nodes", new LiveMap());
            nodes = root.get("nodes");
          }

          let edges = root.get("edges");
          if (!edges) {
            console.log("Storage: 'edges' missing, creating...");
            root.set("edges", new LiveMap());
            edges = root.get("edges");
          }

          let chatMessages = root.get("chatMessages");
          if (!chatMessages) {
            console.log("Storage: 'chatMessages' missing, creating...");
            root.set("chatMessages", new LiveList([]));
          }

          console.log(`Storage: 'nodes' map exists with ${nodes.size} items`);
          console.log(`Storage: 'edges' map exists with ${edges.size} items`);

          console.log(`Processing ${steps.length} steps from AI...`);
          for (const [index, step] of steps.entries()) {
            console.log(`Step ${index + 1}: ${step.toolCalls?.length || 0} tool calls`);
            if (!step.toolCalls || step.toolCalls.length === 0) continue;

            for (const toolCall of step.toolCalls) {
              const toolName = toolCall.toolName;
              const args = (toolCall as any).args || (toolCall as any).input;
              
              console.log(`AI tool call in loop: ${toolName}`, JSON.stringify(args));

              if (!args) {
                console.warn(`Tool call ${toolName} missing arguments in storage loop.`);
                continue;
              }

              switch (toolName) {
                case "addNode": {
                  const nodeId = args.id;
                  if (!nodeId) {
                    console.error("addNode in loop called without ID");
                    continue;
                  }
                  
                  const nodeData: any = {
                    label: args.data?.label || "New Node",
                    shape: args.data?.shape || "rectangle",
                    color: args.data?.color || "#1F1F1F",
                    textColor: args.data?.textColor || "#EDEDED",
                  };
                  
                  const defaultSize = (args.data?.shape === "circle" || args.data?.shape === "diamond") ? 100 : undefined;
                  nodeData.width = args.data?.width || defaultSize || 120;
                  nodeData.height = args.data?.height || defaultSize || 60;

                  // Ensure we use LiveObject for internal data as well if it's nested
                  // AND ensure we are setting fields exactly as CanvasNode expects.
                  // React Flow nodes typically have id, type, position, data.
                  const newNode = new LiveObject({
                    id: nodeId,
                    type: "canvasNode",
                    position: args.position || { x: 0, y: 0 },
                    data: new LiveObject(nodeData),
                  });
                  
                  nodes.set(nodeId, newNode);
                  nodesCreated++;
                  break;
                }
                
                case "moveNode": {
                  const node = nodes.get(args.id);
                  if (node) {
                    console.log(`Storage: Moving node ${args.id} to`, JSON.stringify(args.position));
                    node.set("position", args.position);
                  } else {
                    console.warn(`AI tried to move non-existent node: ${args.id}`);
                  }
                  break;
                }

                case "resizeNode": {
                  const node = nodes.get(args.id);
                  if (node) {
                    console.log(`Storage: Resizing node ${args.id} to ${args.width}x${args.height}`);
                    const data = node.get("data") as any;
                    if (data) {
                      data.set("width", args.width);
                      data.set("height", args.height);
                    }
                  } else {
                    console.warn(`AI tried to resize non-existent node: ${args.id}`);
                  }
                  break;
                }

                case "updateNodeData": {
                  const node = nodes.get(args.id);
                  if (node) {
                    console.log(`Storage: Updating node ${args.id} data`, JSON.stringify(args.data));
                    const data = node.get("data") as any;
                    if (data) {
                      Object.entries(args.data).forEach(([key, value]) => {
                        if (value !== undefined) {
                          data.set(key, value);
                        }
                      });
                    }
                  } else {
                    console.warn(`AI tried to update non-existent node: ${args.id}`);
                  }
                  break;
                }

                case "deleteNode":
                  console.log(`Storage: Deleting node ${args.id}`);
                  nodes.delete(args.id);
                  break;

                case "addEdge":
                  if (!nodes.has(args.source) || !nodes.has(args.target)) {
                    console.warn(`Skipping edge ${args.id}: source (${args.source}) or target (${args.target}) node missing.`);
                    continue;
                  }
                  console.log(`Storage: Adding edge ${args.id} from ${args.source} to ${args.target}`);
                  edges.set(args.id, new LiveObject({
                    id: args.id,
                    type: "canvasEdge",
                    source: args.source,
                    target: args.target,
                    data: new LiveObject({ label: args.label || "" }),
                  }));
                  edgesCreated++;
                  break;
                
                case "deleteEdge":
                  console.log(`Storage: Deleting edge ${args.id}`);
                  edges.delete(args.id);
                  break;

                case "finishDesign":
                  console.log("AI finished design with summary:", args.summary);
                  break;
              }
            }
          }
          console.log(`Mutation complete: ${nodesCreated} nodes, ${edgesCreated} edges.`);
          console.log(`Final storage nodes: ${nodes.size}, edges: ${edges.size}`);
        });
        console.log("mutateStorage promise resolved");

        // Diagnostic check after mutation
        const storageAfterMutate = await liveblocks!.getStorageDocument(payload.roomId, "json");
        console.log(`Diagnostic: Room storage after main mutation: ${JSON.stringify(storageAfterMutate)}`);
      } catch (mutationError) {
        console.error("Error during liveblocks.mutateStorage:", mutationError);
      }

      await broadcastStatus("Design generation complete!", "complete", false);
 
      // Force broadcast an event to notify frontend that storage has changed significantly
      await liveblocks!.broadcastEvent(payload.roomId, {
        type: "ai-status",
        text: "Architecture applied to canvas.",
        active: false,
        senderId: "ai-agent",
        refreshCanvas: true, // Custom flag the frontend can listen to if needed
      });

      return {
        success: true,
        nodesCreated,
        edgesCreated,
        steps: steps.length,
      };
    } catch (error) {
      console.error("Design task failed:", error);
      await broadcastStatus("Design generation failed. Please try again.", "error", false);
      throw error;
    }
  },
});
