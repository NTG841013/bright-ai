"use client"

import { X, Plus, Pencil, Trash2, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Project } from "@prisma/client"
import { Logo } from "@/components/ui/logo"

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
          "absolute top-3 left-3 bottom-3 z-30 flex w-[340px] flex-col rounded-2xl border-[1.5px] border-border-subtle bg-bg-surface/95 shadow-2xl backdrop-blur-md transition-all duration-300 overflow-hidden",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-[calc(100%+24px)] opacity-0"
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b-[1.5px] border-border-subtle px-4">
          <Link href="/" className="flex items-center">
            <Logo className="h-6 w-6" showText={false} />
            <span className="ml-2.5 text-sm font-medium text-text-primary">Bright AI</span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="border-[1.5px] border-accent-primary/20 bg-accent-primary-dim text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-3 mt-3 h-10 w-[calc(100%-1.5rem)] shrink-0 rounded-lg border-[1.5px] border-accent-primary/20 bg-accent-primary-dim p-1">
            <TabsTrigger
              value="my-projects"
              className="flex-1 rounded-lg text-sm font-medium text-accent-primary transition-all data-active:bg-accent-primary/20 data-active:text-accent-primary"
            >
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="flex-1 rounded-lg text-sm font-medium text-accent-primary transition-all data-active:bg-accent-primary/20 data-active:text-accent-primary"
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
        "group/item relative mb-1 flex items-center gap-3 rounded-lg border-[1.5px] border-accent-primary/20 px-3 py-2.5 transition-all duration-200",
        isActive 
          ? "bg-accent-primary/20 text-accent-primary shadow-sm" 
          : "bg-accent-primary-dim text-accent-primary hover:bg-accent-primary/20"
      )}
    >
      {isActive && (
        <div className="absolute left-1 h-1.5 w-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(0,200,212,0.5)]" />
      )}
      <div className={cn(
        "flex h-2 w-2 rounded-full",
        isActive ? "bg-accent-primary" : "bg-accent-primary/40"
      )} />
      <span className={cn(
        "flex-1 truncate text-sm font-medium text-accent-primary"
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
            className="border-[1.5px] border-accent-primary/20 bg-accent-primary-dim text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary"
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
            className="border-[1.5px] border-accent-primary/20 bg-accent-primary-dim text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {project.name}</span>
          </Button>
        </div>
      )}
    </Link>
  )
}
