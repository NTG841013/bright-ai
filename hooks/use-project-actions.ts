"use client"

import { useState, useTransition } from "react"
import { useRouter, useParams } from "next/navigation"
import type { Project } from "@prisma/client"

export type DialogType = "create" | "rename" | "delete" | null

export function useProjectActions() {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = useTransition()
  
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [targetProject, setTargetProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState("")
  const [suffix] = useState(() => Math.random().toString(36).substring(2, 6))

  const openCreate = () => {
    setDialogType("create")
    setProjectName("")
    setTargetProject(null)
  }

  const openRename = (project: Project) => {
    setDialogType("rename")
    setProjectName(project.name)
    setTargetProject(project)
  }

  const openDelete = (project: Project) => {
    setDialogType("delete")
    setTargetProject(project)
  }

  const close = () => {
    setDialogType(null)
    setTargetProject(null)
    setProjectName("")
  }

  const handleCreate = async () => {
    if (!projectName.trim()) return

    startTransition(async () => {
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName.trim() }),
        })

        if (response.ok) {
          const project = await response.json()
          close()
          router.push(`/editor/${project.id}`)
        }
      } catch (error) {
        console.error("Failed to create project:", error)
      }
    })
  }

  const handleRename = async () => {
    if (!targetProject || !projectName.trim()) return

    startTransition(async () => {
      try {
        const response = await fetch(`/api/projects/${targetProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName.trim() }),
        })

        if (response.ok) {
          close()
          router.refresh()
        }
      } catch (error) {
        console.error("Failed to rename project:", error)
      }
    })
  }

  const handleDelete = async () => {
    if (!targetProject) return

    startTransition(async () => {
      try {
        const response = await fetch(`/api/projects/${targetProject.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          const isActive = params.projectId === targetProject.id
          close()
          if (isActive) {
            router.push("/editor")
          } else {
            router.refresh()
          }
        }
      } catch (error) {
        console.error("Failed to delete project:", error)
      }
    })
  }

  return {
    dialogType,
    targetProject,
    projectName,
    setProjectName,
    isLoading: isPending,
    suffix,
    openCreate,
    openRename,
    openDelete,
    close,
    handleCreate,
    handleRename,
    handleDelete,
  }
}
