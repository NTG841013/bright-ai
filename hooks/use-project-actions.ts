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
  const [error, setError] = useState<string | null>(null)
  const [suffix] = useState(() => Math.random().toString(36).substring(2, 6))

  const openCreate = () => {
    setDialogType("create")
    setProjectName("")
    setTargetProject(null)
    setError(null)
  }

  const openRename = (project: Project) => {
    setDialogType("rename")
    setProjectName(project.name)
    setTargetProject(project)
    setError(null)
  }

  const openDelete = (project: Project) => {
    setDialogType("delete")
    setTargetProject(project)
    setError(null)
  }

  const close = () => {
    setDialogType(null)
    setTargetProject(null)
    setProjectName("")
    setError(null)
  }

  const handleCreate = async () => {
    if (!projectName.trim()) return

    startTransition(async () => {
      try {
        setError(null)
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName.trim() }),
        })

        if (response.ok) {
          const project = await response.json()
          close()
          router.push(`/editor/${project.id}`)
        } else {
          const data = await response.json().catch(() => ({}))
          setError(data.error || response.statusText || "Failed to create project")
        }
      } catch (error) {
        console.error("Failed to create project:", error)
        setError("An unexpected error occurred")
      }
    })
  }

  const handleRename = async () => {
    if (!targetProject || !projectName.trim()) return

    startTransition(async () => {
      try {
        setError(null)
        const response = await fetch(`/api/projects/${targetProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName.trim() }),
        })

        if (response.ok) {
          close()
          router.refresh()
        } else {
          const data = await response.json().catch(() => ({}))
          setError(data.error || response.statusText || "Failed to rename project")
        }
      } catch (error) {
        console.error("Failed to rename project:", error)
        setError("An unexpected error occurred")
      }
    })
  }

  const handleDelete = async () => {
    if (!targetProject) return

    startTransition(async () => {
      try {
        setError(null)
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
        } else {
          const data = await response.json().catch(() => ({}))
          setError(data.error || response.statusText || "Failed to delete project")
        }
      } catch (error) {
        console.error("Failed to delete project:", error)
        setError("An unexpected error occurred")
      }
    })
  }

  return {
    dialogType,
    targetProject,
    projectName,
    setProjectName,
    error,
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
