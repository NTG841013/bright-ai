"use client";

import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

interface KeyboardShortcutsProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useKeyboardShortcuts({ undo, redo, canUndo, canRedo }: KeyboardShortcutsProps) {
  const { zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an editable field
      const activeElement = document.activeElement;
      const isEditable = 
        activeElement instanceof HTMLInputElement || 
        activeElement instanceof HTMLTextAreaElement || 
        (activeElement instanceof HTMLElement && activeElement.isContentEditable);

      if (isEditable) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
      const shiftKey = event.shiftKey;

      // Zoom In: + or =
      if ((event.key === "+" || event.key === "=") && !ctrlKey) {
        event.preventDefault();
        zoomIn({ duration: 300 });
      }

      // Zoom Out: -
      if (event.key === "-" && !ctrlKey) {
        event.preventDefault();
        zoomOut({ duration: 300 });
      }

      // Undo: Cmd/Ctrl + Z
      if (ctrlKey && event.key.toLowerCase() === "z" && !shiftKey) {
        event.preventDefault();
        if (canUndo) undo();
      }

      // Redo: Cmd/Ctrl + Shift + Z OR Cmd/Ctrl + Y
      if (
        (ctrlKey && shiftKey && event.key.toLowerCase() === "z") || 
        (ctrlKey && event.key.toLowerCase() === "y")
      ) {
        event.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo, zoomIn, zoomOut]);
}
