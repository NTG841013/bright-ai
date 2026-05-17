"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useParams } from "next/navigation";
import { CanvasNode, CanvasEdge } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave(nodes: CanvasNode[] | null, edges: CanvasEdge[] | null) {
  const params = useParams();
  const projectId = params?.roomId as string;
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setNodes, setEdges } = useReactFlow();
  const [hasLoaded, setHasLoaded] = useState(false);
  const isSavingRef = useRef(false);

  // We use refs to store the latest nodes and edges to avoid re-triggering the effect
  // that sets up the autosave debounce logic.
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const save = useCallback(async (manual = false) => {
    if (!projectId || isSavingRef.current) {
      return;
    }
    
    isSavingRef.current = true;
    setStatus("saving");
    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          nodes: nodesRef.current, 
          edges: edgesRef.current 
        }),
      });

      if (response.ok) {
        setStatus("saved");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(manual ? "Manual save failed:" : "Autosave failed:", error);
      setStatus("error");
    } finally {
      isSavingRef.current = false;
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2000);
    }
  }, [projectId]); // Remove nodes/edges dependency

  // Initial load
  useEffect(() => {
    let isCancelled = false;

    async function loadCanvas() {
      if (!projectId) return;

      try {
        // Only load if we haven't loaded yet
        if (hasLoaded) return;

        // Check if room is empty
        if ((nodes && nodes.length > 0) || (edges && edges.length > 0)) {
          setHasLoaded(true);
          return;
        }

        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (response.ok && !isCancelled) {
          const data = await response.json();
          if (data.nodes?.length > 0 || data.edges?.length > 0) {
            setNodes(data.nodes);
            setEdges(data.edges);
          }
        }
      } catch (error) {
        console.error("Failed to load canvas:", error);
      } finally {
        if (!isCancelled) {
          setHasLoaded(true);
        }
      }
    }

    loadCanvas();

    return () => {
      isCancelled = true;
    };
  }, [projectId, hasLoaded, nodes, edges, setNodes, setEdges]); // Add missing dependencies

  // Autosave
  useEffect(() => {
    // Don't autosave during initial load or if nodes/edges are not yet available
    if (!hasLoaded || !nodes || !edges) return;

    // Guard: Don't autosave if any node or edge is selected (user is likely still making changes)
    const hasSelection = nodes.some(n => n.selected) || edges.some(e => e.selected);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (hasSelection) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, 2000); // 2 second debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [save, nodes, edges, hasLoaded]); // Re-enable nodes/edges here to trigger debounce on change

  const triggerSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return save(true);
  }, [save]);

  return { status, triggerSave };
}
