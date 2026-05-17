"use client";

import { useCallback, memo } from "react";
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from "@xyflow/react";
import { CanvasNode } from "@/types/canvas";
import { cn } from "@/lib/utils";

export const CanvasNodeComponent = memo(({ id, data, selected }: NodeProps<CanvasNode>) => {
  const { setNodes } = useReactFlow();
  const shape = data.shape || "rectangle";
  const width = data.width || 120;
  const height = data.height || 60;

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
  
  const borderColor = selected ? "#00c8d4" : "#3a3a42";
  const fillColor = "#1f1f1f";
  const textColor = "#ededed";

  const renderShape = () => {
    switch (shape) {
      case "circle":
        return (
          <svg width={width} height={height} className="absolute inset-0 pointer-events-none">
            <ellipse
              cx={width / 2}
              cy={height / 2}
              rx={(width - 2) / 2}
              ry={(height - 2) / 2}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth="2"
            />
          </svg>
        );
      case "diamond":
        return (
          <svg width={width} height={height} className="absolute inset-0 pointer-events-none">
            <path
              d={`M ${width / 2} 1 L ${width - 1} ${height / 2} L ${width / 2} ${height - 1} L 1 ${height / 2} Z`}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth="2"
            />
          </svg>
        );
      case "hexagon":
        return (
          <svg width={width} height={height} className="absolute inset-0 pointer-events-none">
            <path
              d={`M ${width * 0.25} 1 L ${width * 0.75} 1 L ${width - 1} ${height / 2} L ${width * 0.75} ${height - 1} L ${width * 0.25} ${height - 1} L 1 ${height / 2} Z`}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth="2"
            />
          </svg>
        );
      case "pill":
        return (
          <div 
            className="absolute inset-0 rounded-full border-2" 
            style={{ backgroundColor: fillColor, borderColor: borderColor }} 
          />
        );
      case "cylinder":
        return (
          <svg width={width} height={height} className="absolute inset-0 pointer-events-none">
            <path
              d={`M 1 ${height * 0.15} L 1 ${height * 0.85} C 1 ${height - 1} ${width - 1} ${height - 1} ${width - 1} ${height * 0.85} L ${width - 1} ${height * 0.15} C ${width - 1} 1 1 1 1 ${height * 0.15} Z`}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth="2"
            />
            <path
              d={`M 1 ${height * 0.15} C 1 ${height * 0.3} ${width - 1} ${height * 0.3} ${width - 1} ${height * 0.15}`}
              fill="none"
              stroke={borderColor}
              strokeWidth="2"
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
    >
      <NodeResizer 
        color="#00c8d4" 
        isVisible={selected} 
        minWidth={50} 
        minHeight={30} 
        onResize={onResize}
      />
      {renderShape()}
      
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2 !bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 !bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 !bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 !bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10" 
      />
      
      <span 
        className="relative z-10 text-sm font-medium text-center truncate px-2"
        style={{ color: textColor }}
      >
        {data.label}
      </span>
    </div>
  );
});

CanvasNodeComponent.displayName = "CanvasNodeComponent";
