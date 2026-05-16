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
import type { ProjectDialogsHook } from "@/hooks/use-project-dialogs"

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

const inputClass =
  "text-text-primary border-border-default placeholder:text-text-faint focus-visible:border-accent-primary focus-visible:ring-accent-primary/30"

const primaryBtnClass =
  "bg-accent-primary text-white hover:bg-accent-primary/90 border-0"

const closeBtnClass =
  "border border-border-default text-text-secondary bg-transparent hover:bg-subtle hover:text-text-primary"

const destructiveBtnClass =
  "bg-state-error/10 text-state-error hover:bg-state-error/20 border-0"

interface ProjectDialogsProps {
  dialogs: ProjectDialogsHook
}

export function ProjectDialogs({ dialogs }: ProjectDialogsProps) {
  const { dialogType, targetProject, projectName, setProjectName, close } = dialogs

  return (
    <>
      <CreateProjectDialog
        open={dialogType === "create"}
        projectName={projectName}
        setProjectName={setProjectName}
        onClose={close}
      />
      <RenameProjectDialog
        open={dialogType === "rename"}
        projectName={projectName}
        currentName={targetProject?.name ?? ""}
        setProjectName={setProjectName}
        onClose={close}
      />
      <DeleteProjectDialog
        open={dialogType === "delete"}
        targetName={targetProject?.name ?? ""}
        onClose={close}
      />
    </>
  )
}

interface CreateProjectDialogProps {
  open: boolean
  projectName: string
  setProjectName: (name: string) => void
  onClose: () => void
}

function CreateProjectDialog({
  open,
  projectName,
  setProjectName,
  onClose,
}: CreateProjectDialogProps) {
  const slug = toSlug(projectName)

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
          <Input
            autoFocus
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={inputClass}
          />
          {slug && (
            <p className="text-xs text-text-faint">
              Slug:{" "}
              <span className="font-mono text-text-muted">{slug}</span>
            </p>
          )}
        </div>
        <DialogFooter className={dialogFooterClass}>
          <Button
            disabled={!projectName.trim()}
            onClick={onClose}
            className={primaryBtnClass}
          >
            Create project
          </Button>
          <Button variant="ghost" onClick={onClose} className={closeBtnClass}>
            Close
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
}

function RenameProjectDialog({
  open,
  projectName,
  currentName,
  setProjectName,
  onClose,
}: RenameProjectDialogProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && projectName.trim()) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle className={titleClass}>Rename project</DialogTitle>
          <DialogDescription className={descriptionClass}>
            Renaming &ldquo;{currentName}&rdquo;
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={handleKeyDown}
          className={inputClass}
        />
        <DialogFooter className={dialogFooterClass}>
          <Button
            disabled={!projectName.trim()}
            onClick={onClose}
            className={primaryBtnClass}
          >
            Rename
          </Button>
          <Button variant="ghost" onClick={onClose} className={closeBtnClass}>
            Close
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
}

function DeleteProjectDialog({ open, targetName, onClose }: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle className={titleClass}>Delete project</DialogTitle>
          <DialogDescription className={descriptionClass}>
            Are you sure you want to delete &ldquo;{targetName}&rdquo;? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={dialogFooterClass}>
          <Button onClick={onClose} className={destructiveBtnClass}>
            Delete
          </Button>
          <Button variant="ghost" onClick={onClose} className={closeBtnClass}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
