"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useRef } from "react";
import { SaveStatus } from "@/hooks/useAutosave";

interface CanvasContextType {
  saveStatus: SaveStatus;
  triggerSave: () => void;
  setSaveState: (status: SaveStatus, trigger: () => void) => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const triggerRef = useRef<(() => void) | null>(null);

  const setSaveState = useCallback((status: SaveStatus, trigger: () => void) => {
    setSaveStatus(status);
    if (triggerRef.current !== trigger) {
      triggerRef.current = trigger;
    }
  }, []);

  const triggerSave = useCallback(() => {
    if (triggerRef.current) {
      triggerRef.current();
    }
  }, [saveStatus]);

  return (
    <CanvasContext.Provider value={{ saveStatus, triggerSave, setSaveState }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  return context;
}
