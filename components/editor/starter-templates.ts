import { CanvasNode, CanvasEdge, NODE_COLORS } from "@/types/canvas";

export type CanvasTemplate = {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A standard microservices setup with API Gateway, Services, and Databases.",
    nodes: [
      {
        id: "gateway",
        type: "canvasNode",
        position: { x: 250, y: 0 },
        data: { label: "API Gateway", shape: "pill", color: NODE_COLORS[1].fill, textColor: NODE_COLORS[1].text, width: 150, height: 60 },
      },
      {
        id: "service-a",
        type: "canvasNode",
        position: { x: 100, y: 150 },
        data: { label: "Order Service", shape: "rectangle", color: NODE_COLORS[2].fill, textColor: NODE_COLORS[2].text, width: 120, height: 80 },
      },
      {
        id: "service-b",
        type: "canvasNode",
        position: { x: 400, y: 150 },
        data: { label: "User Service", shape: "rectangle", color: NODE_COLORS[2].fill, textColor: NODE_COLORS[2].text, width: 120, height: 80 },
      },
      {
        id: "db-a",
        type: "canvasNode",
        position: { x: 100, y: 300 },
        data: { label: "Orders DB", shape: "cylinder", color: NODE_COLORS[7].fill, textColor: NODE_COLORS[7].text, width: 100, height: 80 },
      },
      {
        id: "db-b",
        type: "canvasNode",
        position: { x: 400, y: 300 },
        data: { label: "Users DB", shape: "cylinder", color: NODE_COLORS[7].fill, textColor: NODE_COLORS[7].text, width: 100, height: 80 },
      },
    ],
    edges: [
      { id: "e-g-a", source: "gateway", target: "service-a", type: "canvasEdge" },
      { id: "e-g-b", source: "gateway", target: "service-b", type: "canvasEdge" },
      { id: "e-a-da", source: "service-a", target: "db-a", type: "canvasEdge" },
      { id: "e-b-db", source: "service-b", target: "db-b", type: "canvasEdge" },
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "Automated pipeline from code commit to production deployment.",
    nodes: [
      {
        id: "source",
        type: "canvasNode",
        position: { x: 0, y: 100 },
        data: { label: "Source Code", shape: "rectangle", color: NODE_COLORS[3].fill, textColor: NODE_COLORS[3].text, width: 120, height: 60 },
      },
      {
        id: "build",
        type: "canvasNode",
        position: { x: 200, y: 100 },
        data: { label: "Build & Test", shape: "diamond", color: NODE_COLORS[1].fill, textColor: NODE_COLORS[1].text, width: 120, height: 100 },
      },
      {
        id: "deploy-staging",
        type: "canvasNode",
        position: { x: 400, y: 100 },
        data: { label: "Deploy Staging", shape: "pill", color: NODE_COLORS[6].fill, textColor: NODE_COLORS[6].text, width: 140, height: 60 },
      },
      {
        id: "approval",
        type: "canvasNode",
        position: { x: 600, y: 100 },
        data: { label: "Manual Approval", shape: "hexagon", color: NODE_COLORS[2].fill, textColor: NODE_COLORS[2].text, width: 140, height: 80 },
      },
      {
        id: "deploy-prod",
        type: "canvasNode",
        position: { x: 800, y: 100 },
        data: { label: "Deploy Production", shape: "pill", color: NODE_COLORS[4].fill, textColor: NODE_COLORS[4].text, width: 160, height: 60 },
      },
    ],
    edges: [
      { id: "e-s-b", source: "source", target: "build", type: "canvasEdge" },
      { id: "e-b-ds", source: "build", target: "deploy-staging", type: "canvasEdge" },
      { id: "e-ds-a", source: "deploy-staging", target: "approval", type: "canvasEdge" },
      { id: "e-a-dp", source: "approval", target: "deploy-prod", type: "canvasEdge" },
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Decoupled architecture using an Event Bus and subscribers.",
    nodes: [
      {
        id: "producer",
        type: "canvasNode",
        position: { x: 100, y: 0 },
        data: { label: "Event Producer", shape: "pill", color: NODE_COLORS[5].fill, textColor: NODE_COLORS[5].text, width: 150, height: 60 },
      },
      {
        id: "bus",
        type: "canvasNode",
        position: { x: 100, y: 150 },
        data: { label: "Event Bus", shape: "rectangle", color: NODE_COLORS[1].fill, textColor: NODE_COLORS[1].text, width: 400, height: 40 },
      },
      {
        id: "sub-1",
        type: "canvasNode",
        position: { x: 0, y: 300 },
        data: { label: "Notification Service", shape: "rectangle", color: NODE_COLORS[2].fill, textColor: NODE_COLORS[2].text, width: 140, height: 70 },
      },
      {
        id: "sub-2",
        type: "canvasNode",
        position: { x: 200, y: 300 },
        data: { label: "Analytics Service", shape: "rectangle", color: NODE_COLORS[2].fill, textColor: NODE_COLORS[2].text, width: 140, height: 70 },
      },
      {
        id: "sub-3",
        type: "canvasNode",
        position: { x: 400, y: 300 },
        data: { label: "Audit Service", shape: "rectangle", color: NODE_COLORS[2].fill, textColor: NODE_COLORS[2].text, width: 140, height: 70 },
      },
    ],
    edges: [
      { id: "e-p-b", source: "producer", target: "bus", type: "canvasEdge" },
      { id: "e-b-s1", source: "bus", target: "sub-1", type: "canvasEdge" },
      { id: "e-b-s2", source: "bus", target: "sub-2", type: "canvasEdge" },
      { id: "e-b-s3", source: "bus", target: "sub-3", type: "canvasEdge" },
    ],
  },
];
