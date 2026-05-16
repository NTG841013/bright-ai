"use client"

import { useState } from "react"

export interface MockProject {
  id: string
  name: string
  slug: string
  owned: boolean
}

export const MOCK_PROJECTS: MockProject[] = [
  { id: "1", name: "Bright AI Platform", slug: "bright-ai-platform", owned: true },
  { id: "2", name: "Auth Service", slug: "auth-service", owned: true },
  { id: "3", name: "Team Backend", slug: "team-backend", owned: false },
]

export type DialogType = "create" | "rename" | "delete" | null

export interface ProjectDialogsHook {
  dialogType: DialogType
  targetProject: MockProject | null
  projectName: string
  setProjectName: (name: string) => void
  isLoading: boolean
  openCreate: () => void
  openRename: (project: MockProject) => void
  openDelete: (project: MockProject) => void
  close: () => void
}

export function useProjectDialogs(): ProjectDialogsHook {
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [targetProject, setTargetProject] = useState<MockProject | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function openCreate() {
    setDialogType("create")
    setTargetProject(null)
    setProjectName("")
  }

  function openRename(project: MockProject) {
    setDialogType("rename")
    setTargetProject(project)
    setProjectName(project.name)
  }

  function openDelete(project: MockProject) {
    setDialogType("delete")
    setTargetProject(project)
    setProjectName("")
  }

  function close() {
    setDialogType(null)
    setIsLoading(false)
  }

  return {
    dialogType,
    targetProject,
    projectName,
    setProjectName,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    close,
  }
}
