"use client";

import { useCallback, useMemo, useRef } from "react";
import { 
  ReactFlow, 
  MiniMap, 
  Background, 
  BackgroundVariant, 
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
  Node,
  NodeResizer,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { CanvasNode, CanvasEdge, NodeShape } from "@/types/canvas";
import { ShapePanel } from "./shape-panel";
import { CanvasNodeComponent } from "./canvas-node";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, setNodes } = useReactFlow();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    nodes: {
      initial: [],
    },
    edges: {
      initial: [],
    },
  });

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (!data) {
        return;
      }

      const { shape, width, height } = JSON.parse(data) as {
        shape: NodeShape;
        width: number;
        height: number;
      };

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CanvasNode = {
        id: `${shape}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: "canvasNode",
        position,
        data: { 
          label: "", 
          shape,
          width,
          height,
        },
      };

      setNodes((nds) => nds.concat(newNode as any));
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <div className="h-full w-full bg-[#0a0a0a]" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes ?? []}
        edges={edges ?? []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <MiniMap 
          className="!bg-background border-border-subtle"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
      <ShapePanel />
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
