"use client"

import { AiSidebar } from "./ai-sidebar"
import { useCanvas } from "./canvas-context"

interface EditorRoomContentProps {
  children: React.ReactNode
  projectId: string
}

export function EditorRoomContent({ children, projectId }: EditorRoomContentProps) {
  const canvas = useCanvas()
  
  return (
    <>
      {children}
      <AiSidebar 
        isOpen={canvas?.aiSidebarOpen ?? false} 
        onClose={() => canvas?.setAiSidebarOpen(false)} 
        projectId={projectId}
        roomId={projectId}
      />
    </>
  )
}
