"use client"

import { useState } from "react"
import { Sparkles, Bot } from "lucide-react"
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
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-base)]">
      <EditorNavbar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        projectId={activeProject?.id}
        projectName={activeProject?.name}
        onToggleAi={() => setAiSidebarOpen((o) => !o)}
        isOwner={isOwner}
      />
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
      <main className="relative flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {children ?? <EditorHome onNewProject={projectActions.openCreate} />}
        </div>
        
        {activeProject && aiSidebarOpen && (
          <aside className="absolute right-3 top-3 bottom-3 z-30 flex w-80 flex-col gap-4 rounded-2xl border border-border-subtle bg-bg-surface/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-text-primary tracking-tight">AI Copilot</h3>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Placeholder panel</p>
              </div>
              <Sparkles className="h-4 w-4 text-accent-ai" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="rounded-2xl border border-border-default bg-bg-elevated/50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-ai/10 text-accent-ai">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-text-primary">Chat surface pending</h4>
                    <p className="text-xs leading-relaxed text-text-muted">
                      The toggle is wired. Messaging and generation are intentionally out of scope here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto rounded-xl border border-dashed border-border-subtle p-4 bg-bg-base/30">
              <h5 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-2">Future Hooks</h5>
              <p className="text-xs leading-relaxed text-text-muted">
                Prompt composer, run status, and architecture guidance will attach to this sidebar.
              </p>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}
