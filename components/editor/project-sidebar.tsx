"use client"

import { X, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Project } from "@prisma/client"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewProject: () => void
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  onRename,
  onDelete,
  ownedProjects,
  sharedProjects,
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
          "fixed left-3 top-[3.75rem] z-50 flex w-72 flex-col rounded-2xl border border-border-subtle bg-bg-surface/95 backdrop-blur-xl transition-transform duration-200",
          "bottom-3",
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

        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-3 mt-3 w-[calc(100%-1.5rem)] shrink-0 bg-bg-elevated">
            <TabsTrigger
              value="my-projects"
              className="flex-1 text-text-muted hover:text-text-secondary data-active:bg-bg-subtle data-active:text-text-primary data-active:border-border-subtle"
            >
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="flex-1 text-text-muted hover:text-text-secondary data-active:bg-bg-subtle data-active:text-text-primary data-active:border-border-subtle"
            >
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="m-0 flex flex-1 flex-col overflow-hidden">
            {ownedProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-text-muted">No projects yet.</p>
              </div>
            ) : (
              <ScrollArea className="flex-1 px-2 py-2">
                {ownedProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onRename={onRename}
                    onDelete={onDelete}
                    showActions
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="shared" className="m-0 flex flex-1 flex-col overflow-hidden">
            {sharedProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-text-muted">Nothing shared yet.</p>
              </div>
            ) : (
              <ScrollArea className="flex-1 px-2 py-2">
                {sharedProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onRename={onRename}
                    onDelete={onDelete}
                    showActions={false}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-border-default p-3">
          <Button
            variant="ghost"
            size="default"
            onClick={onNewProject}
            className="w-full gap-2 border border-accent-primary/20 bg-accent-primary-dim text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}

interface ProjectItemProps {
  project: Project
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
  showActions: boolean
}

function ProjectItem({ project, onRename, onDelete, showActions }: ProjectItemProps) {
  return (
    <div className="group/item flex items-center gap-1 rounded-xl px-2 py-2 hover:bg-bg-elevated">
      <span className="flex-1 truncate text-sm text-text-primary">{project.name}</span>
      {showActions && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onRename(project)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Rename {project.name}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(project)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {project.name}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
