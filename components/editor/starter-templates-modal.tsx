"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CANVAS_TEMPLATES, CanvasTemplate } from "./starter-templates";
import { CanvasNode, CanvasEdge } from "@/types/canvas";
import { cn } from "@/lib/utils";
import { Download, X } from "lucide-react";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[1400px] w-[95vw] lg:w-[98vw] max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden border-border-subtle bg-[#111113] rounded-3xl"
        showCloseButton={false}
      >
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-white">Import Template</DialogTitle>
            <DialogClose className="rounded-full p-2 hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <DialogDescription className="text-[15px] text-text-muted mt-2">
            Choose a starter template to pre-populate your canvas. Any existing nodes will be replaced — use <kbd className="font-sans px-1 rounded bg-white/10 text-white/70">⌘Z</kbd> to undo.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            {CANVAS_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onImport={() => {
                  onImport(template);
                  onOpenChange(false);
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({
  template,
  onImport,
}: {
  template: CanvasTemplate;
  onImport: () => void;
}) {
  return (
    <div className="group flex flex-col rounded-[24px] border border-white/5 bg-[#141416] overflow-hidden transition-all hover:border-white/10 w-full">
      <div className="aspect-[1.4] bg-[#0c0c0e] relative p-8 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <TemplatePreview nodes={template.nodes} edges={template.edges} />
      </div>
      <div className="p-8 flex flex-col gap-4 flex-1 bg-[#141416]">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-white text-center">
            {template.name}
          </h3>
          <p className="text-[14px] leading-relaxed text-text-muted text-center line-clamp-2 px-2">
            {template.description}
          </p>
        </div>
        <div className="mt-4 px-2">
          <Button 
            onClick={onImport}
            className="w-full h-11 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl gap-2 text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ nodes, edges }: { nodes: CanvasNode[]; edges: CanvasEdge[] }) {
  if (nodes.length === 0) return null;

  // Calculate bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    const x = node.position.x;
    const y = node.position.y;
    const w = node.data.width || 120;
    const h = node.data.height || 60;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });

  const padding = 100;
  const width = Math.max(maxX - minX + padding * 2, 400);
  const height = Math.max(maxY - minY + padding * 2, 400);
  const viewBox = `${minX - (width - (maxX - minX)) / 2} ${minY - (height - (maxY - minY)) / 2} ${width} ${height}`;

  return (
    <svg 
      viewBox={viewBox} 
      className="w-full h-full drop-shadow-2xl"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="preview-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Draw edges */}
      {edges.map((edge) => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return null;

        const sx = source.position.x + (source.data.width || 120) / 2;
        const sy = source.position.y + (source.data.height || 60) / 2;
        const tx = target.position.x + (target.data.width || 120) / 2;
        const ty = target.position.y + (target.data.height || 60) / 2;

        return (
          <path
            key={edge.id}
            d={`M ${sx} ${sy} L ${tx} ${ty}`}
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="3"
            strokeDasharray="8 8"
          />
        );
      })}

      {/* Draw nodes */}
      {nodes.map((node) => {
        const { x, y } = node.position;
        const w = node.data.width || 120;
        const h = node.data.height || 60;
        const fill = node.data.color || "#1f1f1f";
        const shape = node.data.shape || "rectangle";
        const glowColor = node.data.textColor || "#ffffff";

        return (
          <g key={node.id}>
            {shape === "circle" && (
              <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2.5} fill={fill} stroke="white" strokeOpacity="0.2" strokeWidth="2" />
            )}
            {shape === "pill" && (
              <rect x={x + w*0.1} y={y + h*0.1} width={w*0.8} height={h*0.8} rx={h*0.4} fill={fill} stroke="white" strokeOpacity="0.2" strokeWidth="2" />
            )}
            {shape === "diamond" && (
              <path d={`M ${x + w / 2} ${y + h*0.1} L ${x + w*0.9} ${y + h / 2} L ${x + w / 2} ${y + h*0.9} L ${x + w*0.1} ${y + h / 2} Z`} fill={fill} stroke="white" strokeOpacity="0.2" strokeWidth="2" />
            )}
            {shape === "hexagon" && (
              <path d={`M ${x + w * 0.3} ${y + h*0.1} L ${x + w * 0.7} ${y + h*0.1} L ${x + w*0.9} ${y + h / 2} L ${x + w * 0.7} ${y + h*0.9} L ${x + w * 0.3} ${y + h*0.9} L ${x + w*0.1} ${y + h / 2} Z`} fill={fill} stroke="white" strokeOpacity="0.2" strokeWidth="2" />
            )}
            {shape === "cylinder" && (
              <g>
                <rect x={x + w*0.1} y={y + h*0.12} width={w*0.8} height={h*0.76} fill={fill} stroke="white" strokeOpacity="0.2" strokeWidth="2" />
                <ellipse cx={x + w/2} cy={y + h*0.12} rx={w*0.4} ry={h*0.12} fill={fill} stroke="white" strokeOpacity="0.2" strokeWidth="2" />
                <ellipse cx={x + w/2} cy={y + h*0.88} rx={w*0.4} ry={h*0.12} fill={fill} stroke="white" strokeOpacity="0.1" strokeWidth="2" />
              </g>
            )}
            {shape === "rectangle" && (
              <rect x={x + w*0.1} y={y + h*0.1} width={w*0.8} height={h*0.8} rx="8" fill={fill} stroke="white" strokeOpacity="0.2" strokeWidth="2" />
            )}
            
            {/* Top glow indicator */}
            <rect 
              x={x + w*0.35} 
              y={y + h*0.1} 
              width={w*0.3} 
              height={4} 
              rx={2} 
              fill={glowColor} 
              className="opacity-60"
              style={{ filter: 'blur(4px)' }}
            />
          </g>
        );
      })}
    </svg>
  );
}
