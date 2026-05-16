"use client"

import { useState } from "react"
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ShareDialog } from "./share-dialog"

interface EditorNavbarProps {
    isOpen: boolean
    onToggle: () => void
    projectId?: string
    projectName?: string
    onToggleAi?: () => void
    isOwner?: boolean
}

export function EditorNavbar({ isOpen, onToggle, projectId, projectName, onToggleAi, isOwner = false }: EditorNavbarProps) {
    const [isShareOpen, setIsShareOpen] = useState(false)
    return (
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-default bg-bg-surface px-3">
            <div className="flex min-w-0 items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onToggle}>
                    {isOpen ? (
                        <PanelLeftClose className="h-5 w-5" />
                    ) : (
                        <PanelLeftOpen className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle sidebar</span>
                </Button>

                {projectName ? (
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{projectName}</p>
                        <p className="text-xs text-text-faint">Workspace</p>
                    </div>
                ) : null}
            </div>

            <div className="flex items-center gap-2">
                {projectName && (
                    <>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hidden h-7 gap-2 border border-border-default px-3 md:flex"
                            onClick={() => setIsShareOpen(true)}
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="text-xs">Share</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onToggleAi}
                            className="h-7 gap-2 border border-accent-primary/20 bg-accent-primary-dim px-3 text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">AI</span>
                        </Button>
                    </>
                )}
                <UserButton />
            </div>

            {projectId && (
                <ShareDialog 
                    projectId={projectId} 
                    isOpen={isShareOpen} 
                    onClose={() => setIsShareOpen(false)} 
                    isOwner={isOwner}
                />
            )}
        </header>
    )
}
