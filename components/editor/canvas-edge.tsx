"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
} from "@xyflow/react";
import { CanvasEdge } from "@/types/canvas";
import { cn } from "@/lib/utils";

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  interactionWidth = 20,
}: EdgeProps<CanvasEdge>) {
  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayLabel = data?.label || "";

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLabel(displayLabel);
    setIsEditing(true);
  }, [displayLabel]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setEdges((edges) =>
      edges.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            data: {
              ...e.data,
              label,
            },
          };
        }
        return e;
      })
    );
  }, [id, label, setEdges]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleBlur();
      }
      if (e.key === "Escape") {
        setIsEditing(false);
        setLabel(data?.label || "");
      }
    },
    [data?.label, handleBlur]
  );

  return (
    <>
      <path
        id={id}
        className={cn(
          "react-flow__edge-path transition-all duration-300 fill-none stroke-[2px]",
          selected ? "stroke-[#00c8d4]" : "stroke-[#f8fafc] opacity-60 hover:opacity-100 hover:stroke-[#00c8d4]"
        )}
        d={edgePath}
        markerEnd="url(#bright-arrowhead)"
      />
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={interactionWidth}
        className="react-flow__edge-interaction cursor-pointer"
        onDoubleClick={onDoubleClick}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              className="bg-[#18181c] border border-[#00c8d4] text-[#f0f0f4] text-xs rounded-full px-2 py-0.5 outline-none min-w-[40px]"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={onKeyDown}
              style={{
                width: `${Math.max(40, label.length * 8)}px`,
              }}
            />
          ) : (
            (displayLabel || selected) && (
              <div
                onDoubleClick={onDoubleClick}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-text whitespace-nowrap",
                  displayLabel 
                    ? "bg-[#18181c] border border-[#3a3a42] text-[#c0c0cc] hover:border-[#00c8d4] hover:text-[#f0f0f4]" 
                    : "bg-transparent border border-dashed border-[#505060] text-[#505060] opacity-0 hover:opacity-100"
                )}
              >
                {displayLabel || "Add label"}
              </div>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
