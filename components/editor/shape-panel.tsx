"use client";

import { Square, Diamond, Circle, Minus, Database, Hexagon } from "lucide-react";
import { NodeShape } from "@/types/canvas";

const SHAPES: { shape: NodeShape; icon: any; width: number; height: number }[] = [
  { shape: "rectangle", icon: Square, width: 120, height: 60 },
  { shape: "diamond", icon: Diamond, width: 80, height: 80 },
  { shape: "circle", icon: Circle, width: 70, height: 70 },
  { shape: "pill", icon: Minus, width: 100, height: 40 },
  { shape: "cylinder", icon: Database, width: 70, height: 90 },
  { shape: "hexagon", icon: Hexagon, width: 80, height: 70 },
];

export function ShapePanel() {
  const onDragStart = (event: React.DragEvent, shape: NodeShape, width: number, height: number) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ shape, width, height }));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-[#18181c]/80 backdrop-blur-md border border-[#3a3a42] rounded-full px-4 py-2 shadow-2xl">
        {SHAPES.map(({ shape, icon: Icon, width, height }) => (
          <div
            key={shape}
            draggable
            onDragStart={(e) => onDragStart(e, shape, width, height)}
            className="p-2 cursor-grab active:cursor-grabbing hover:bg-[#1e1e23] rounded-full transition-colors group relative"
          >
            <Icon className="w-5 h-5 text-[#c0c0cc] group-hover:text-[#f0f0f4]" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1e1e23] border border-[#3a3a42] text-[#f0f0f4] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none capitalize">
              {shape}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
