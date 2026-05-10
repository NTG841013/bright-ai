"use client"

import Link from "next/link"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectRow {
  id: string
  name: string
}

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  projects: ProjectRow[]
  onNewProject: () => void
  activeProjectId?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onNewProject,
  activeProjectId,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-bg-base/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-3 left-3 top-[3.75rem] z-50 flex w-72 flex-col rounded-2xl border border-border-subtle bg-bg-surface/95 backdrop-blur-xl transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-default px-4">
          <span className="text-sm font-medium text-text-primary">Projects</span>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-3">
          {projects.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-text-muted">No projects yet.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {projects.map((project) => (
                <li key={project.id}>
                  <ProjectItem project={project} active={project.id === activeProjectId} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 p-3 border-t border-border-default">
          <Button variant="default" size="default" className="w-full gap-2" onClick={onNewProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}

interface ProjectItemProps {
  project: ProjectRow
  active?: boolean
}

function ProjectItem({ project, active = false }: ProjectItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors",
        active ? "border-border-subtle bg-accent-primary-dim" : "border-transparent hover:bg-bg-subtle"
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full bg-border-subtle", active && "bg-accent-primary")} />
      <Link
        href={`/editor/${project.id}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
        )}
      >
        {project.name}
      </Link>
    </div>
  )
}
