"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectActions } from "@/hooks/use-project-actions"

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

const dialogContentClass =
  "bg-elevated text-text-primary ring-border-default"

const dialogFooterClass =
  "bg-transparent border-border-default"

const titleClass =
  "text-text-primary"

const descriptionClass =
  "text-text-muted"

const previewClass =
  "text-xs font-mono text-text-faint bg-bg-subtle px-2 py-1 rounded border border-border-subtle truncate"

const inputClass =
  "text-text-primary border-border-default placeholder:text-text-faint focus-visible:border-accent-primary focus-visible:ring-accent-primary/30"

const primaryBtnClass =
  "bg-accent-primary text-white hover:bg-accent-primary/90 border-0 disabled:opacity-50 disabled:cursor-not-allowed"

const closeBtnClass =
  "border border-border-default text-text-secondary bg-transparent hover:bg-subtle hover:text-text-primary"

const destructiveBtnClass =
  "bg-state-error/10 text-state-error hover:bg-state-error/20 border-0 disabled:opacity-50 disabled:cursor-not-allowed"

interface ProjectDialogsProps {
  actions: ReturnType<typeof useProjectActions>
}

export function ProjectDialogs({ actions }: ProjectDialogsProps) {
  const { 
    dialogType, 
    targetProject, 
    projectName, 
    setProjectName, 
    close,
    isLoading,
    suffix,
    handleCreate,
    handleRename,
    handleDelete,
  } = actions

  return (
    <>
      <CreateProjectDialog
        open={dialogType === "create"}
        projectName={projectName}
        setProjectName={setProjectName}
        onClose={close}
        onSubmit={handleCreate}
        isLoading={isLoading}
        suffix={suffix}
      />
      <RenameProjectDialog
        open={dialogType === "rename"}
        projectName={projectName}
        currentName={targetProject?.name ?? ""}
        setProjectName={setProjectName}
        onClose={close}
        onSubmit={handleRename}
        isLoading={isLoading}
      />
      <DeleteProjectDialog
        open={dialogType === "delete"}
        targetName={targetProject?.name ?? ""}
        onClose={close}
        onSubmit={handleDelete}
        isLoading={isLoading}
      />
    </>
  )
}

interface CreateProjectDialogProps {
  open: boolean
  projectName: string
  setProjectName: (name: string) => void
  onClose: () => void
  onSubmit: () => void
  isLoading: boolean
  suffix: string
}

function CreateProjectDialog({
  open,
  projectName,
  setProjectName,
  onClose,
  onSubmit,
  isLoading,
  suffix,
}: CreateProjectDialogProps) {
  const slug = toSlug(projectName)
  const roomId = slug ? `${slug}-${suffix}` : ""

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle className={titleClass}>New project</DialogTitle>
          <DialogDescription className={descriptionClass}>
            Give your project a name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <Input
              autoFocus
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={inputClass}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && projectName.trim()) {
                  onSubmit()
                }
              }}
            />
            {roomId && (
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[10px] uppercase tracking-wider text-text-faint font-bold">Room ID Preview:</span>
                <code className={previewClass}>{roomId}</code>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className={dialogFooterClass}>
          <Button variant="outline" onClick={onClose} className={closeBtnClass} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            className={primaryBtnClass} 
            onClick={onSubmit}
            disabled={!projectName.trim() || isLoading}
          >
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RenameProjectDialogProps {
  open: boolean
  projectName: string
  currentName: string
  setProjectName: (name: string) => void
  onClose: () => void
  onSubmit: () => void
  isLoading: boolean
}

function RenameProjectDialog({
  open,
  projectName,
  currentName,
  setProjectName,
  onClose,
  onSubmit,
  isLoading,
}: RenameProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle className={titleClass}>Rename project</DialogTitle>
          <DialogDescription className={descriptionClass}>
            Enter a new name for "{currentName}".
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={inputClass}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && projectName.trim() && projectName !== currentName) {
                onSubmit()
              }
            }}
          />
        </div>
        <DialogFooter className={dialogFooterClass}>
          <Button variant="outline" onClick={onClose} className={closeBtnClass} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            className={primaryBtnClass} 
            onClick={onSubmit}
            disabled={!projectName.trim() || projectName === currentName || isLoading}
          >
            {isLoading ? "Saving..." : "Rename Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteProjectDialogProps {
  open: boolean
  targetName: string
  onClose: () => void
  onSubmit: () => void
  isLoading: boolean
}

function DeleteProjectDialog({
  open,
  targetName,
  onClose,
  onSubmit,
  isLoading,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle className={titleClass}>Delete project</DialogTitle>
          <DialogDescription className={descriptionClass}>
            Are you sure you want to delete "{targetName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={dialogFooterClass}>
          <Button variant="outline" onClick={onClose} className={closeBtnClass} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            className={destructiveBtnClass} 
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
