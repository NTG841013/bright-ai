"use client";

import { useCallback, memo, useState, useEffect, useRef } from "react";
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from "@xyflow/react";
import { CanvasNode, NODE_COLORS } from "@/types/canvas";
import { cn } from "@/lib/utils";

export const CanvasNodeComponent = memo(({ id, data, selected }: NodeProps<CanvasNode>) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const shape = data.shape || "rectangle";
  const width = data.width || 120;
  const height = data.height || 60;
  const fillColor = data.color || "#1f1f1f";
  const textColor = data.textColor || "#ededed";

  // Sync internal label state with data.label when data.label changes (e.g. from other users)
  useEffect(() => {
    if (!isEditing) {
      setLabel(data.label || "");
    }
  }, [data.label, isEditing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const onResize = useCallback(
    (_: any, { width, height }: { width: number; height: number }) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                width,
                height,
              },
            };
          }
          return n;
        })
      );
    },
    [id, setNodes]
  );

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Persist changes
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              label,
            },
          };
        }
        return n;
      })
    );
  }, [id, label, setNodes]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setLabel(data.label || ""); // Revert
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  }, [data.label, handleBlur]);

  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLabel(e.target.value);
  }, []);

  const onColorSelect = useCallback((fill: string, text: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              color: fill,
              textColor: text,
            },
          };
        }
        return n;
      })
    );
  }, [id, setNodes]);
  
  const borderColor = selected ? "#00c8d4" : "#2a2a32"; // Brighter when selected, more subtle at rest

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
      className="group relative flex items-center justify-center p-2"
      style={{ width, height }}
      onDoubleClick={handleDoubleClick}
    >
      {selected && (
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#18181c] border border-[#3a3a42] rounded-full px-2 py-1.5 flex items-center gap-1.5 shadow-xl z-[100] nodrag nopan"
          onClick={(e) => e.stopPropagation()}
        >
          {NODE_COLORS.map((color) => (
            <button
              key={color.fill}
              className={cn(
                "w-4 h-4 rounded-full border border-white/10 transition-all hover:scale-125",
                fillColor === color.fill && "ring-2 ring-white/40 ring-offset-1 ring-offset-[#18181c]"
              )}
              style={{ 
                backgroundColor: color.fill,
                // @ts-ignore - custom property for hover glow
                "--hover-glow": color.text 
              }}
              onClick={() => onColorSelect(color.fill, color.text)}
              title={color.fill}
            >
              <div 
                className="w-full h-full rounded-full opacity-0 hover:opacity-100 transition-opacity"
                style={{ 
                  boxShadow: `0 0 8px ${color.text}`,
                }}
              />
            </button>
          ))}
        </div>
      )}
      <NodeResizer 
        color="#00c8d4" 
        handleStyle={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00c8d4', border: 'none' }}
        lineStyle={{ border: 'none' }}
        isVisible={selected} 
        minWidth={50} 
        minHeight={30} 
        onResize={onResize}
      />
      {renderShape()}
      
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top-target"
        className="w-2 h-2 !bg-white !border !border-[#2a2a32] opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top-source"
        className="w-2 h-2 !bg-white !border !border-[#2a2a32] opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom-target"
        className="w-2 h-2 !bg-white !border !border-[#2a2a32] opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom-source"
        className="w-2 h-2 !bg-white !border !border-[#2a2a32] opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left-target"
        className="w-2 h-2 !bg-white !border !border-[#2a2a32] opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left-source"
        className="w-2 h-2 !bg-white !border !border-[#2a2a32] opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right-target"
        className="w-2 h-2 !bg-white !border !border-[#2a2a32] opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right-source"
        className="w-2 h-2 !bg-white !border !border-[#2a2a32] opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      
      <div className="relative z-10 flex items-center justify-center w-full h-full px-2 pointer-events-none">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="nodrag nopan w-full bg-transparent text-sm font-medium text-center outline-none resize-none overflow-hidden pointer-events-auto"
            value={label}
            onChange={handleLabelChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ color: textColor }}
          />
        ) : (
          <span 
            className="text-sm font-medium text-center truncate select-none"
            style={{ color: textColor }}
          >
            {data.label || <span className="opacity-40 italic">Label</span>}
          </span>
        )}
      </div>
    </div>
  );
});

CanvasNodeComponent.displayName = "CanvasNodeComponent";
