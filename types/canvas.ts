import { Node, Edge } from "@xyflow/react";

export type NodeShape = 
  | "rectangle" 
  | "diamond" 
  | "circle" 
  | "pill" 
  | "cylinder" 
  | "hexagon";

export type NodeColor = {
  fill: string;
  text: string;
};

export const NODE_COLORS: NodeColor[] = [
  { fill: "#1F1F1F", text: "#EDEDED" }, // Neutral dark (default)
  { fill: "#10233D", text: "#52A8FF" }, // Blue
  { fill: "#2E1938", text: "#BF7AF0" }, // Purple
  { fill: "#331B00", text: "#FF990A" }, // Orange
  { fill: "#3C1618", text: "#FF6166" }, // Red
  { fill: "#3A1726", text: "#F75F8F" }, // Pink
  { fill: "#0F2E18", text: "#62C073" }, // Green
  { fill: "#062822", text: "#0AC7B4" }, // Teal
];

export type CanvasNodeData = {
  label: string;
  color?: string;
  textColor?: string;
  shape?: NodeShape;
  width?: number;
  height?: number;
};

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdgeData = {
  label?: string;
};

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;
