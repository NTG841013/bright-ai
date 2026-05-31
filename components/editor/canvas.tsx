"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { 
  ReactFlow, 
  Background, 
  BackgroundVariant, 
  ConnectionMode,
  useReactFlow,
  MarkerType,
  ConnectionLineType,
  useNodes,
  useEdges,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo, useMyPresence, useEventListener, useMutation } from "@liveblocks/react/suspense";
import { LiveObject, LiveMap } from "@liveblocks/client";
import { CanvasNode, CanvasEdge, NodeShape } from "@/types/canvas";
import { AiRoomEventSchema } from "@/types/tasks";
import { ShapePanel } from "./shape-panel";
import { CanvasNodeComponent } from "./canvas-node";
import { CanvasEdgeComponent } from "./canvas-edge";
import { CanvasControls } from "./canvas-controls";
import { PresenceAvatars } from "./presence-avatars";
import { LiveCursors } from "./live-cursors";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAutosave, SaveStatus } from "@/hooks/useAutosave";
import { CanvasProvider, useCanvas } from "./canvas-context";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

const edgeTypes = {
  canvasEdge: CanvasEdgeComponent,
};

const defaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#f8fafc",
    width: 20,
    height: 20,
  },
};

type DragState = {
  shape: NodeShape;
  width: number;
  height: number;
  x: number;
  y: number;
} | null;

function DragPreview({ dragState }: { dragState: DragState }) {
  if (!dragState) return null;

  const { shape, width, height, x, y } = dragState;
  const fillColor = "#1f1f1f";
  const borderColor = "#2a2a32";

  const renderShape = () => {
    switch (shape) {
      case "circle":
        return (
          <div 
            className="absolute inset-0 rounded-full border-2" 
            style={{ backgroundColor: fillColor, borderColor: borderColor }} 
          />
        );
      case "diamond":
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 pointer-events-none overflow-visible">
            <path
              d={`M ${width / 2} 1 L ${width - 1} ${height / 2} L ${width / 2} ${height - 1} L 1 ${height / 2} Z`}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        );
      case "hexagon":
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 pointer-events-none overflow-visible">
            <path
              d={`M ${width * 0.25} 1 L ${width * 0.75} 1 L ${width - 1} ${height / 2} L ${width * 0.75} ${height - 1} L ${width * 0.25} ${height - 1} L 1 ${height / 2} Z`}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        );
      case "pill":
        return (
          <div 
            className="absolute inset-0 rounded-[9999px] border-2" 
            style={{ backgroundColor: fillColor, borderColor: borderColor }} 
          />
        );
      case "cylinder":
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 pointer-events-none overflow-visible">
            <path
              d={`M 1 ${height * 0.15} L 1 ${height * 0.85} C 1 ${height - 1} ${width - 1} ${height - 1} ${width - 1} ${height * 0.85} L ${width - 1} ${height * 0.15} C ${width - 1} 1 1 1 1 ${height * 0.15} Z`}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M 1 ${height * 0.15} C 1 ${height * 0.3} ${width - 1} ${height * 0.3} ${width - 1} ${height * 0.15}`}
              fill="none"
              stroke={borderColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        );
      case "rectangle":
      default:
        return (
          <div 
            className="absolute inset-0 rounded-md border-2" 
            style={{ backgroundColor: fillColor, borderColor: borderColor }} 
          />
        );
    }
  };

  return (
    <div
      className="fixed pointer-events-none z-[9999] opacity-50"
      style={{
        width,
        height,
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      {renderShape()}
    </div>
  );
}

const MIN_NODE_SIZE = 40;
const MAX_NODE_SIZE = 1000;

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, setNodes } = useReactFlow();
  const [dragState, setDragState] = useState<DragState>(null);
  
  const nodes = useNodes<CanvasNode>();
  const edges = useEdges<CanvasEdge>();

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [, updateMyPresence] = useMyPresence();

  useKeyboardShortcuts({ undo, redo, canUndo, canRedo });

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    updateMyPresence({ cursor: position });
  }, [screenToFlowPosition, updateMyPresence]);

  const onPointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const {
    nodes: _nodes,
    edges: _edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
  } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    nodes: {
      initial: [],
    },
    edges: {
      initial: [],
    },
  });

  // Listen for manual refresh signals from the AI agent
  useEventListener(({ event }) => {
    const result = AiRoomEventSchema.safeParse(event);
    if (result.success && result.data.type === "ai-status" && result.data.refreshCanvas) {
      console.log("Canvas: Refresh signal received from AI Agent. Forcing sync.");
      // React Flow doesn't have a direct "refresh from source" but we can nudge it
      // by ensuring any local state that might be shadowing Liveblocks is cleared
      // or simply logging for now to see if the signal arrives.
    }
  });

  // Watch for Liveblocks updates and sync React Flow if they seem to disagree
  // but only if we're not currently dragging or interacting.
  useEffect(() => {
    if (_nodes && _nodes.length > 0) {
      console.log("Canvas: Liveblocks storage has nodes, ensuring React Flow is in sync", _nodes.length);
    }
  }, [_nodes]);

  useEffect(() => {
    console.log("Canvas: Nodes/Edges updated from Liveblocks", {
      nodesCount: _nodes?.length,
      edgesCount: _edges?.length,
      firstNode: _nodes?.[0]?.id,
      _nodesRaw: _nodes // Detailed log
    });
  }, [_nodes, _edges]);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Only handle delete if something is actually selected
    const selectedNodes = nodes?.filter((node) => node.selected);
    const selectedEdges = edges?.filter((edge) => edge.selected);
    
    if (!selectedNodes?.length && !selectedEdges?.length) {
      return;
    }

    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      console.log("CanvasInner: Delete/Backspace key detected", {
        key: event.key,
        selectedNodesCount: selectedNodes?.length,
        selectedEdgesCount: selectedEdges?.length,
      });

      console.log("CanvasInner: Calling onDelete", {
        nodes: selectedNodes.map(n => n.id),
        edges: selectedEdges.map(e => e.id)
      });
      onDelete?.({
        nodes: selectedNodes || [],
        edges: selectedEdges || [],
      });
    }
  }, [nodes, edges, onDelete]);

  const { status, triggerSave } = useAutosave(_nodes, _edges);
  const canvas = useCanvas();
  const { fitView } = useReactFlow();

  const importTemplateMutation = useMutation(({ storage }, template: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => {
    let flow = storage.get("flow");
    if (!flow) {
      storage.set("flow", new LiveObject({
        nodes: new LiveMap(),
        edges: new LiveMap(),
      }));
      flow = storage.get("flow");
    }

    const nodesMap = flow.get("nodes");
    const edgesMap = flow.get("edges");

    if (!nodesMap || !edgesMap) {
      console.error("Canvas: Could not find nodes or edges map in storage");
      return;
    }

    // Clear existing nodes
    const nodeKeys = Array.from(nodesMap.keys());
    for (const key of nodeKeys) {
      nodesMap.delete(key);
    }

    // Clear existing edges
    const edgeKeys = Array.from(edgesMap.keys());
    for (const key of edgeKeys) {
      edgesMap.delete(key);
    }

    // Add template nodes
    for (const node of template.nodes) {
      nodesMap.set(node.id, new LiveObject(node as any));
    }

    // Add template edges
    for (const edge of template.edges) {
      edgesMap.set(edge.id, new LiveObject(edge as any));
    }
  }, []);

  const handleImportTemplate = useCallback((template: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => {
    importTemplateMutation(template);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 100);
  }, [importTemplateMutation, fitView]);

  useEffect(() => {
    if (canvas) {
      canvas.setImportTemplate(handleImportTemplate);
    }
    return () => {
      if (canvas) {
        canvas.setImportTemplate(null);
      }
    };
  }, [canvas, handleImportTemplate]);

  useEffect(() => {
    if (canvas) {
      canvas.setSaveState(status, triggerSave);
    }
  }, [status, triggerSave]); // Removed canvas from dependencies to reduce re-registration noise

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const data = event.dataTransfer.getData("application/reactflow");
    if (data) {
      try {
        const { shape, width, height } = JSON.parse(data);
        setDragState({
          shape,
          width,
          height,
          x: event.clientX,
          y: event.clientY,
        });
      } catch (e) {
        // Ignore
      }
    } else if (dragState) {
      // If we already have a dragState, just update the position
      setDragState(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
    }
  }, [dragState]);

  const onDragLeave = useCallback(() => {
    setDragState(null);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragState(null);

      const data = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (!data) {
        return;
      }

      try {
        const parsed = JSON.parse(data);
        
        // Basic object check
        if (!parsed || typeof parsed !== "object") {
          return;
        }

        const { shape, width, height, offsetX = 0, offsetY = 0 } = parsed;

        // Validate NodeShape
        const validShapes: NodeShape[] = [
          "rectangle",
          "diamond",
          "circle",
          "pill",
          "cylinder",
          "hexagon",
        ];

        if (!validShapes.includes(shape)) {
          return;
        }

        // Validate dimensions
        if (typeof width !== "number" || typeof height !== "number") {
          return;
        }

        // Clamp dimensions to sane bounds
        const clampedWidth = Math.min(Math.max(width, MIN_NODE_SIZE), MAX_NODE_SIZE);
        const clampedHeight = Math.min(Math.max(height, MIN_NODE_SIZE), MAX_NODE_SIZE);

        const position = screenToFlowPosition({
          x: event.clientX - offsetX,
          y: event.clientY - offsetY,
        });

        const newNode: CanvasNode = {
          id: `${shape}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: "canvasNode",
          position,
          data: {
            label: "",
            shape: shape as NodeShape,
            width: clampedWidth,
            height: clampedHeight,
          },
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (e) {
        // Abort on parse error
        console.error("Failed to parse drag payload", e);
        return;
      }
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <div 
      className="h-full w-full bg-[#0a0a0a]" 
      ref={reactFlowWrapper}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <PresenceAvatars />
      <ReactFlow
        nodes={_nodes ?? []}
        edges={_edges ?? []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "#f8fafc", strokeWidth: 2, opacity: 0.6 }}
        fitView={false}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
      >
        <LiveCursors />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <svg 
          width="0" 
          height="0" 
          style={{ position: 'absolute', pointerEvents: 'none' }} 
          overflow="visible" 
          aria-hidden="true" 
          focusable="false"
        >
          <defs>
            <marker
              id="bright-arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,7 L10,3.5 Z" fill="#f8fafc" />
            </marker>
          </defs>
        </svg>
      </ReactFlow>
      <DragPreview dragState={dragState} />
      <ShapePanel />
      <CanvasControls />
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
