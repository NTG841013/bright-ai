import { Node, Edge } from "@xyflow/react";

export type NodeShape = 
  | "rectangle" 
  | "diamond" 
  | "circle" 
  | "pill" 
  | "cylinder" 
  | "hexagon";

export type CanvasNodeData = {
  label: string;
  color?: string;
  shape?: NodeShape;
  width?: number;
  height?: number;
};

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge<Record<string, unknown>, "canvasEdge">;
