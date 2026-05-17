"use client";

import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Undo2, 
  Redo2 
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react/suspense";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const handleZoomIn = () => zoomIn({ duration: 300 });
  const handleZoomOut = () => zoomOut({ duration: 300 });
  const handleFitView = () => fitView({ duration: 300 });

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <TooltipProvider>
        <div className="flex h-11 items-center gap-1 rounded-full border border-border-subtle bg-background/80 px-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger render={<Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="top">Zoom Out (-)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger render={<Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleFitView}
                >
                  <Maximize className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="top">Fit View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger render={<Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="top">Zoom In (+)</TooltipContent>
            </Tooltip>
          </div>

          <div className="mx-1 h-4 w-[1px] bg-border-subtle" />

          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger render={<Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    !canUndo && "opacity-40 cursor-not-allowed"
                  )}
                  onClick={() => canUndo && undo()}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="top">Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger render={<Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    !canRedo && "opacity-40 cursor-not-allowed"
                  )}
                  onClick={() => canRedo && redo()}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="top">Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
