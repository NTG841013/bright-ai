"use client"

import { X, Plus, Pencil, Trash2, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Project } from "@prisma/client"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewProject: () => void
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
  ownedProjects: Project[]
  sharedProjects: Project[]
  activeProjectId?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  onRename,
  onDelete,
  ownedProjects,
  sharedProjects,
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
          "absolute top-3 left-3 bottom-3 z-30 flex w-72 flex-col rounded-2xl border-[1.5px] border-border-subtle bg-bg-surface/90 shadow-2xl backdrop-blur-md transition-all duration-300 overflow-hidden",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-[calc(100%+24px)] opacity-0"
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b-[1.5px] border-border-subtle px-4">
          <span className="text-sm font-medium text-text-primary">Projects</span>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-3 mt-3 h-10 w-[calc(100%-1.5rem)] shrink-0 bg-bg-elevated p-1">
            <TabsTrigger
              value="my-projects"
              className="flex-1 rounded-lg text-xs font-medium text-text-muted transition-all data-active:bg-bg-subtle data-active:text-text-primary data-active:shadow-sm"
            >
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="flex-1 rounded-lg text-xs font-medium text-text-muted transition-all data-active:bg-bg-subtle data-active:text-text-primary data-active:shadow-sm"
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
                    isActive={project.id === activeProjectId}
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
                    isActive={project.id === activeProjectId}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t-[1.5px] border-border-subtle p-3">
          <Button
            variant="ghost"
            size="default"
            onClick={onNewProject}
            className="w-full gap-2 border-[1.5px] border-accent-primary/20 bg-accent-primary-dim text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary"
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
  isActive?: boolean
}

function ProjectItem({ project, onRename, onDelete, showActions, isActive }: ProjectItemProps) {
  return (
    <Link
      href={`/editor/${project.id}`}
      className={cn(
        "group/item relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
        isActive 
          ? "bg-bg-elevated text-text-primary shadow-sm border-[1.5px] border-border-subtle" 
          : "text-text-secondary hover:bg-bg-elevated/50 hover:text-text-primary"
      )}
    >
      {isActive && (
        <div className="absolute left-1 h-1.5 w-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(0,200,212,0.5)]" />
      )}
      <div className={cn(
        "flex h-2 w-2 rounded-full",
        isActive ? "bg-accent-primary" : "bg-text-muted"
      )} />
      <span className={cn(
        "flex-1 truncate text-sm font-medium",
        isActive ? "text-text-primary" : "text-text-secondary"
      )}>
        {project.name}
      </span>
      {showActions && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault()
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
              e.preventDefault()
              e.stopPropagation()
              onDelete(project)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {project.name}</span>
          </Button>
        </div>
      )}
    </Link>
  )
}
