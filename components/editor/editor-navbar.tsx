"use client"

import { useState, useEffect } from "react"
import { LayoutTemplate, PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ShareDialog } from "./share-dialog"
import { StarterTemplatesModal } from "./starter-templates-modal"
import { useReactFlow } from "@xyflow/react"
import { CanvasTemplate } from "./starter-templates"

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
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { setNodes, setEdges, fitView } = useReactFlow()

    const handleImportTemplate = (template: CanvasTemplate) => {
        setNodes(template.nodes);
        setEdges(template.edges);
        // Small timeout to allow nodes to render before fitting view
        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 50);
    }

    useEffect(() => {
        setMounted(true)
    }, [])
    return (
        <header className="flex h-12 shrink-0 items-center justify-between border-[1.5px] border-border-subtle bg-bg-surface px-3 rounded-xl mx-3 mt-3 shadow-sm">
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
                            className="hidden h-7 gap-2 border-[1.5px] border-border-subtle px-3 lg:flex"
                            onClick={() => setIsTemplatesOpen(true)}
                        >
                            <LayoutTemplate className="h-3.5 w-3.5" />
                            <span className="text-xs">Templates</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hidden h-7 gap-2 border-[1.5px] border-border-subtle px-3 md:flex"
                            onClick={() => setIsShareOpen(true)}
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="text-xs">Share</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onToggleAi}
                            className="h-7 gap-2 border-[1.5px] border-accent-primary/20 bg-accent-primary-dim px-3 text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">AI</span>
                        </Button>
                    </>
                )}
                {mounted ? (
                    <UserButton />
                ) : (
                    <div className="h-7 w-7 animate-pulse rounded-full bg-border-subtle" />
                )}
            </div>

            {projectId && (
                <>
                    <ShareDialog 
                        projectId={projectId} 
                        isOpen={isShareOpen} 
                        onClose={() => setIsShareOpen(false)} 
                        isOwner={isOwner}
                    />
                    <StarterTemplatesModal
                        open={isTemplatesOpen}
                        onOpenChange={setIsTemplatesOpen}
                        onImport={handleImportTemplate}
                    />
                </>
            )}
        </header>
    )
}
