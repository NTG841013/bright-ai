"use client"

import { useState } from "react"
import { Sparkles, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReactFlow, ReactFlowProvider } from "@xyflow/react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogs } from "./project-dialogs"
import { EditorHome } from "./editor-home"
import { AiSidebar } from "./ai-sidebar"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { Project } from "@prisma/client"

interface EditorShellProps {
  children?: React.ReactNode
  ownedProjects: Project[]
  sharedProjects: Project[]
  activeProject?: Project
  isOwner?: boolean
}

export function EditorShell({
  children,
  ownedProjects,
  sharedProjects,
  activeProject,
  isOwner = false,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const projectActions = useProjectActions()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <ReactFlowProvider>
        <EditorNavbar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
          projectId={activeProject?.id}
          projectName={activeProject?.name}
          onToggleAi={() => setAiSidebarOpen((o) => !o)}
          isOwner={isOwner}
        />
        <main className="relative flex flex-1 overflow-hidden p-3">
          <ProjectSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onNewProject={projectActions.openCreate}
            onRename={projectActions.openRename}
            onDelete={projectActions.openDelete}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            activeProjectId={activeProject?.id}
          />
          <ProjectDialogs actions={projectActions} />
          
          <div className="flex-1 overflow-hidden rounded-2xl border-[1.5px] border-border-subtle bg-bg-surface/50 shadow-sm relative">
            {children ?? <EditorHome onNewProject={projectActions.openCreate} />}
          </div>
          
          {activeProject && (
            <AiSidebar 
              isOpen={aiSidebarOpen} 
              onClose={() => setAiSidebarOpen(false)} 
            />
          )}
        </main>
      </ReactFlowProvider>
    </div>
  )
}
