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
import { usePlatform } from "@/hooks/use-platform";
import { SaveStatus } from "@/hooks/useAutosave";
import { Cloud, CloudUpload, CloudOff } from "lucide-react";

import { useCanvas } from "./canvas-context";

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const { isMac } = usePlatform();
  const canvas = useCanvas();
  const saveStatus = canvas?.saveStatus;

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
                  aria-label="Zoom Out"
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
                  aria-label="Fit View"
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
                  aria-label="Zoom In"
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
                  aria-label="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="top">Undo ({isMac ? "⌘Z" : "Ctrl+Z"})</TooltipContent>
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
                  aria-label="Redo"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="top">Redo ({isMac ? "⌘Y" : "Ctrl+Y"})</TooltipContent>
            </Tooltip>
          </div>

          <div className="mx-1 h-4 w-[1px] bg-border-subtle" />

          <div className="flex items-center px-1">
            <Tooltip>
              <TooltipTrigger render={
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-text-faint transition-colors">
                  {saveStatus === "saving" && (
                    <CloudUpload className="h-4 w-4 animate-bounce text-accent-primary" />
                  )}
                  {saveStatus === "saved" && (
                    <Cloud className="h-4 w-4 text-green-500" />
                  )}
                  {saveStatus === "error" && (
                    <CloudOff className="h-4 w-4 text-red-500" />
                  )}
                  {(saveStatus === "idle" || !saveStatus) && (
                    <Cloud className="h-4 w-4 opacity-20" />
                  )}
                </div>
              } />
              <TooltipContent side="top">
                {saveStatus === "saving" ? "Saving to cloud..." : 
                 saveStatus === "saved" ? "All changes saved" : 
                 saveStatus === "error" ? "Error saving changes" : 
                 "Changes synced"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
