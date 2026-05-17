"use client"

import { useState, useEffect, useCallback } from "react"
import { Share2, Copy, Check, X, UserPlus, Loader2, Mail, Link as LinkIcon, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

interface EnrichedCollaborator {
  email: string
  name: string | null
  imageUrl: string | null
  isClerkUser: boolean
  role: "OWNER" | "COLLABORATOR"
}

interface ShareDialogProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
  isOwner: boolean
}

export function ShareDialog({ projectId, isOpen, onClose, isOwner }: ShareDialogProps) {
  const { user } = useUser()
  const [owner, setOwner] = useState<EnrichedCollaborator | null>(null)
  const [collaborators, setCollaborators] = useState<EnrichedCollaborator[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    return String(err)
  }

  const fetchCollaborators = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`)
      if (!res.ok) throw new Error("Failed to fetch collaborators")
      const data = await res.json()
      setOwner(data.owner)
      setCollaborators(data.collaborators)
    } catch (err) {
      setError("Could not load collaborators")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators()
    }
  }, [isOpen, fetchCollaborators])

  const copyLink = () => {
    const url = `${window.location.origin}/editor/${projectId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    setIsInviting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to invite collaborator")
      }

      setInviteEmail("")
      await fetchCollaborators()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (email: string) => {
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators/${encodeURIComponent(email)}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to remove collaborator")
      await fetchCollaborators()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-bg-surface border-border-default rounded-3xl shadow-2xl backdrop-blur-xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">Share project</h2>
            <p className="text-sm text-text-muted">Invite collaborators, copy the workspace link, and manage access.</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Workspace Link Section */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-border-subtle bg-bg-base/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary">Workspace link</h3>
                  <p className="text-xs text-text-muted truncate">
                    Share a direct link with teammates after you grant them access.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "shrink-0 h-9 gap-2 transition-all rounded-xl border-border-subtle bg-bg-elevated/50 hover:bg-bg-elevated",
                    copied ? "text-state-success border-state-success/50" : "text-text-primary"
                  )}
                  onClick={copyLink}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span className="text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span className="text-xs">Copy link</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Invite Section (Owners Only) */}
          {isOwner && (
            <div className="space-y-3">
              <form onSubmit={handleInvite} className="relative flex items-center">
                <div className="absolute left-3 text-text-muted pointer-events-none">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-bg-base/50 border-border-subtle text-text-primary text-sm h-11 pl-10 pr-24 rounded-2xl focus-visible:ring-accent-primary/20"
                  disabled={isInviting}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isInviting || !inviteEmail}
                  className="absolute right-1.5 h-8 gap-2 bg-accent-primary text-white hover:bg-accent-primary/90 border-0 rounded-xl px-4"
                >
                  {isInviting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="text-xs font-semibold">Invite</span>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* People with access list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">People with access</h3>
              {!isLoading && (
                <span className="text-[10px] font-medium text-text-faint uppercase tracking-wider">
                  {(collaborators.length + (owner ? 1 : 0))} total
                </span>
              )}
            </div>
            
            <ScrollArea className="h-[280px] -mx-1 px-1">
              <div className="space-y-2 pb-2">
                {isLoading ? (
                  <div className="flex h-20 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
                  </div>
                ) : (
                  <>
                    {/* Always show Owner first */}
                    {owner && (
                      <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-base/30 p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border-subtle">
                            {owner.imageUrl ? (
                              <img src={owner.imageUrl} alt={owner.name || "Owner"} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-text-muted bg-bg-subtle text-xs font-bold uppercase">
                                {(owner.name?.[0] || owner.email[0]).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-text-primary">
                                {owner.name || owner.email}
                                {user?.primaryEmailAddress?.emailAddress?.toLowerCase() === owner.email.toLowerCase() && (
                                  <span className="ml-1.5 text-[10px] text-text-muted font-normal">(You)</span>
                                )}
                              </p>
                              <span className="shrink-0 rounded-full bg-accent-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-primary border border-accent-primary/20">
                                Owner
                              </span>
                            </div>
                            <p className="truncate text-xs text-text-muted">
                              {owner.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {collaborators.map((collab) => (
                      <div
                        key={collab.email}
                        className="group flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-base/30 p-3 transition-colors hover:bg-bg-elevated/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-bg-subtle border border-border-subtle">
                            {collab.imageUrl ? (
                              <img src={collab.imageUrl} alt={collab.name || collab.email} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-text-muted bg-bg-subtle text-xs font-bold uppercase">
                                {(collab.name?.[0] || collab.email[0]).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-text-primary">
                                {collab.name || collab.email.split('@')[0]}
                                {user?.primaryEmailAddress?.emailAddress?.toLowerCase() === collab.email.toLowerCase() && (
                                  <span className="ml-1.5 text-[10px] text-text-muted font-normal">(You)</span>
                                )}
                              </p>
                              <span className="shrink-0 rounded-full bg-bg-subtle px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-muted border border-border-subtle">
                                Collaborator
                              </span>
                            </div>
                            <p className="truncate text-xs text-text-muted">
                              {collab.email}
                            </p>
                          </div>
                        </div>
                        
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-text-faint hover:text-state-error hover:bg-state-error/10 rounded-lg transition-all"
                            onClick={() => handleRemove(collab.email)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove {collab.email}</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {error && (
            <p className="text-xs text-state-error font-medium bg-state-error/5 border border-state-error/20 p-2 rounded-xl text-center">
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
