"use client"

import { useState } from "react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogs } from "./project-dialogs"
import { EditorHome } from "./editor-home"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { Project } from "@prisma/client"

interface EditorShellProps {
  children?: React.ReactNode
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function EditorShell({
  children,
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const projectActions = useProjectActions()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-base)]">
      <EditorNavbar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewProject={projectActions.openCreate}
        onRename={projectActions.openRename}
        onDelete={projectActions.openDelete}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
      />
      <ProjectDialogs actions={projectActions} />
      <main className="flex flex-1 overflow-hidden">
        {children ?? <EditorHome onNewProject={projectActions.openCreate} />}
      </main>
    </div>
  )
}
