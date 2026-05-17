"use client"

import { Bot, FileText, Send, Sparkles, X, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState, KeyboardEvent } from "react"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [input, setInput] = useState("")

  if (!isOpen) return null

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Logic for submitting would go here
      setInput("")
    }
  }

  const starterChips = [
    "Design an e-commerce backend",
    "Create a chat app architecture",
    "Build a CI/CD pipeline",
  ]

  return (
    <aside className="absolute top-3 right-3 bottom-3 z-30 flex w-85 flex-col overflow-hidden rounded-2xl border-[1.5px] border-border-subtle bg-bg-surface/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-ai/10 text-accent-ai">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">AI Workspace</h3>
            <p className="text-[10px] text-text-muted">Collaborate with Bright AI</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-text-muted hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4 pt-4">
          <TabsList className="w-full bg-bg-subtle/50 p-1">
            <TabsTrigger 
              value="architect" 
              className="flex-1 data-active:bg-accent-ai data-active:text-white"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger 
              value="specs" 
              className="flex-1 data-active:bg-accent-ai data-active:text-white"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="flex flex-1 flex-col overflow-hidden outline-none">
          <ScrollArea className="flex-1 px-4 py-4">
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-ai/10 text-accent-ai">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="mb-2 text-sm font-medium text-text-primary">How can I help you today?</h4>
              <p className="mb-6 px-4 text-xs text-text-muted leading-relaxed">
                I can help you design architectures, document systems, or optimize your workflows.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 px-4">
                {starterChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setInput(chip)}
                    className="rounded-full bg-bg-subtle px-3 py-1.5 text-xs font-medium text-accent-ai-text transition-colors hover:bg-bg-subtle/80"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border-subtle p-4">
            <div className="relative flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/50 p-2 focus-within:border-accent-ai/50 transition-colors">
              <Textarea
                placeholder="Ask Bright AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[72px] max-h-[160px] w-full resize-none border-0 bg-transparent p-2 text-sm focus-visible:ring-0"
              />
              <div className="flex items-center justify-between px-1 pb-1">
                <p className="text-[10px] text-text-faint">
                  Enter to send, Shift+Enter for newline
                </p>
                <Button 
                  size="sm" 
                  className="h-8 w-8 bg-accent-ai text-white hover:bg-accent-ai/90"
                  disabled={!input.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex flex-1 flex-col overflow-hidden px-4 py-4 outline-none">
          <Button className="mb-6 w-full bg-accent-ai text-white hover:bg-accent-ai/90">
            Generate Spec
          </Button>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Drafts & Exports</h5>
            
            {/* Demo Spec Card */}
            <div className="group relative flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-elevated p-4 transition-colors hover:border-border-default">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-subtle text-text-secondary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">System Architecture v1</h4>
                    <p className="text-[10px] text-text-muted">Markdown • 1.2 KB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="h-8 w-8 text-text-faint opacity-50"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-text-muted line-clamp-2">
                This document contains the high-level architecture for the proposed e-commerce backend service...
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
