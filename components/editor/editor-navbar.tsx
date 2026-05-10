"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
    isOpen: boolean
    onToggle: () => void
    projectName?: string
}

export function EditorNavbar({ isOpen, onToggle, projectName }: EditorNavbarProps) {
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
                <UserButton />
            </div>
        </header>
    )
}
