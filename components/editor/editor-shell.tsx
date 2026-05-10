"use client"

import { useState } from "react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"

export function EditorShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-base)]">
      <EditorNavbar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={[]}
        onNewProject={() => {}}
      />
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
