"use client"

import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed bottom-0 left-0 top-12 z-40 flex w-72 flex-col",
        "border-r border-border-default bg-surface",
        "transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <span className="text-sm font-medium text-text-primary">Projects</span>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 w-auto">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects" className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">No projects yet</p>
        </TabsContent>
        <TabsContent value="shared" className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">No shared projects</p>
        </TabsContent>
      </Tabs>

      <div className="border-t border-border-default p-4">
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
