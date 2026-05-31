"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useRef } from "react";
import { SaveStatus } from "@/hooks/useAutosave";
import { CanvasTemplate } from "./starter-templates";

interface CanvasContextType {
  saveStatus: SaveStatus;
  triggerSave: () => void;
  setSaveState: (status: SaveStatus, trigger: () => void) => void;
  aiSidebarOpen: boolean;
  setAiSidebarOpen: (open: boolean) => void;
  projectSidebarOpen: boolean;
  setProjectSidebarOpen: (open: boolean) => void;
  importTemplate: ((template: CanvasTemplate) => void) | null;
  setImportTemplate: (fn: ((template: CanvasTemplate) => void) | null) => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [projectSidebarOpen, setProjectSidebarOpen] = useState(false);
  const triggerRef = useRef<(() => void) | null>(null);
  const importTemplateRef = useRef<((template: CanvasTemplate) => void) | null>(null);

  const setImportTemplate = useCallback((fn: ((template: CanvasTemplate) => void) | null) => {
    importTemplateRef.current = fn;
  }, []);

  const importTemplate = useCallback((template: CanvasTemplate) => {
    if (importTemplateRef.current) {
      importTemplateRef.current(template);
    }
  }, []);

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
    <CanvasContext.Provider value={{ 
      saveStatus, 
      triggerSave, 
      setSaveState,
      aiSidebarOpen,
      setAiSidebarOpen,
      projectSidebarOpen,
      setProjectSidebarOpen,
      importTemplate,
      setImportTemplate,
    }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  return context;
}
