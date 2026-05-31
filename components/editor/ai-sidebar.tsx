"use client"

import { Bot, FileText, Send, Sparkles, X, Download, Loader2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState, KeyboardEvent, useEffect, useRef } from "react"
import { useMyPresence, useOthers, useBroadcastEvent, useEventListener, useSelf, useStorage, useMutation } from "@liveblocks/react/suspense"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { AiStatusMessage, AiStatusMessageSchema, AiChatMessage, AiChatMessageSchema, AiRoomEventSchema } from "@/types/tasks"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"
import { LiveList, LiveObject } from "@liveblocks/client"
import {
  Dialog,
  DialogContent,
  
  
} from "@/components/ui/dialog"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  roomId: string
}

export function AiSidebar({ isOpen, onClose, projectId, roomId }: AiSidebarProps) {
  const [input, setInput] = useState("")
  const [lastAiStatus, setLastAiStatus] = useState<AiStatusMessage | null>(null)
  const messages = useStorage((root) => root.chatMessages) || []
  const [runState, setRunState] = useState<{ runId: string; publicToken: string } | null>(null)
  const [specs, setSpecs] = useState<any[]>([])
  const [previewSpec, setPreviewSpec] = useState<any | null>(null)
  const [previewContent, setPreviewContent] = useState<string>("")
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const [{ thinking }, updateMyPresence] = useMyPresence()
  const self = useSelf()
  const others = useOthers()
  const broadcast = useBroadcastEvent()
  const flow = useStorage((root) => root.flow)

  // Listen for AI events from anyone in the room
  useEventListener(({ event }) => {
    const result = AiRoomEventSchema.safeParse(event)
    if (result.success) {
      const data = result.data
      if (data.type === "ai-status") {
        setLastAiStatus(data)
      }
    }
  })

  const addChatMessage = useMutation(({ storage }, message: AiChatMessage) => {
    let chatMessages = storage.get("chatMessages")
    if (!chatMessages) {
      storage.set("chatMessages", new LiveList([]))
      chatMessages = storage.get("chatMessages")
    }
    chatMessages.push(new LiveObject(message))
  }, [])

  const fetchSpecs = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`, {
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        setSpecs(data)
      }
    } catch (error) {
      console.error("Failed to fetch specs:", error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSpecs()
    }
  }, [isOpen, projectId])

  const handleGenerateSpec = async () => {
    if (isAnyAiActive || isGeneratingSpec) return
    setIsGeneratingSpec(true)
    updateMyPresence({ thinking: true })

    try {
      // Prepare payload
      const chatHistory = messages.map(m => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content
      }))

      const nodes = flow.nodes instanceof Map ? Array.from(flow.nodes.values()) : Object.values(flow.nodes || {})
      const edges = flow.edges instanceof Map ? Array.from(flow.edges.values()) : Object.values(flow.edges || {})

      // 1. Trigger generation
      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory,
          nodes,
          edges
        })
      })

      if (!res.ok) throw new Error("Failed to trigger spec generation")
      const { runId } = await res.json()

      // 2. Get token
      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId })
      })

      if (!tokenRes.ok) throw new Error("Failed to get run token")
      const { token } = await tokenRes.json()

      // 3. Track
      setRunState({ runId, publicToken: token });

      // Add user message to chat history
      const chatMessage: AiChatMessage = {
        type: "ai-chat",
        sender: {
          id: self.id,
          name: self.info.name,
          avatar: self.info.avatar,
        },
        role: "user",
        content: "Generate a technical specification for this design.",
        timestamp: Date.now(),
      };
      addChatMessage(chatMessage);
      broadcast(chatMessage);

      broadcast({
        type: "ai-status",
        text: "Generating technical specification...",
        active: true,
        senderId: self.id
      })
      setLastAiStatus({
        type: "ai-status",
        text: "Generating technical specification...",
        active: true,
        senderId: self.id
      })
    } catch (error) {
      console.error("Spec Generation Error:", error)
      setIsGeneratingSpec(false)
      updateMyPresence({ thinking: false })
    }
  }

  const handlePreviewSpec = async (spec: any) => {
    setPreviewSpec(spec)
    setIsPreviewLoading(true)
    setPreviewContent("")

    try {
      const res = await fetch(`/api/projects/${projectId}/specs/${spec.id}/download`, {
        cache: 'no-store'
      })
      if (res.ok) {
        const text = await res.text()
        setPreviewContent(text)
      } else {
        setPreviewContent("Failed to load specification content.")
      }
    } catch (error) {
      console.error("Failed to fetch spec content:", error)
      setPreviewContent("Error loading specification.")
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleDownloadSpec = async (specId: string, specName?: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/specs/${specId}/download`, {
        cache: 'no-store'
      })
      
      if (!res.ok) throw new Error("Failed to download spec")
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = specName ? `${specName.replace(/\s+/g, "_")}.md` : `spec-${specId}.md`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
    } catch (error) {
      console.error("Download Error:", error)
    }
  }

  const resetAiState = (taskID?: string) => {
    if (taskID === "generate-spec") {
      fetchSpecs();
    }
    
    setIsGeneratingSpec(false);
    setRunState(null);
    setLastAiStatus((prev) => ({
      type: "ai-status",
      text: "AI is ready",
      active: false,
      senderId: prev?.senderId || "ai-agent"
    }));
    updateMyPresence({ thinking: false });
  };

  // Update onComplete for useRealtimeRun to also handle spec completion
  const { run } = useRealtimeRun(runState?.runId ?? "", {
    accessToken: runState?.publicToken ?? "",
    enabled: !!runState?.runId && !!runState?.publicToken,
    onComplete: (completedRun) => {
      console.log("Run completed:", completedRun.id, completedRun.status);
      const taskID = (completedRun as any).taskIdentifier || (completedRun as any).task;

      // Create and persist final AI message
      const finalMessage: AiChatMessage = {
        type: "ai-chat",
        sender: {
          id: "ai-agent",
          name: "Bright AI",
          avatar: undefined,
        },
        role: "ai",
        content: taskID === "generate-spec" 
          ? `Technical specification generated! You can now view and download it from the Specs tab.`
          : `Generation complete! I've updated the canvas with the new design components.`,
        timestamp: Date.now(),
      };
      
      broadcast(finalMessage);
      addChatMessage(finalMessage);
      
      resetAiState(taskID);
    },
  });

  // Fallback useEffect to ensure state is cleared if onComplete is missed or hook re-mounts
  useEffect(() => {
    if (run && ["COMPLETED", "FAILED", "CANCELED", "EXPIRED", "TIMED_OUT"].includes(run.status)) {
      if (isGeneratingSpec || thinking || runState) {
        console.warn("Run reached terminal state but local state was still active. Syncing...");
        const taskID = (run as any).taskIdentifier || (run as any).task;
        resetAiState(taskID);
      }
    }
  }, [run?.status, isGeneratingSpec, thinking, runState]);

  const isRunActive = !!run && ["PENDING", "QUEUED", "EXECUTING", "REHYDRATING", "WAITING_FOR_DEPLOY", "PAUSED", "STALLED"].includes(run.status);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isRunActive])

  // Check if anyone (including self) is currently "thinking" or run is active
  const isAnyAiActive = thinking || others.some((other) => other.presence.thinking) || lastAiStatus?.active || isRunActive;

  const handleSubmit = async () => {
    if (!input.trim() || isAnyAiActive) return
    
    const content = input.trim()
    
    // Create and broadcast chat message
    const chatMessage: AiChatMessage = {
      type: "ai-chat",
      sender: {
        id: self.id,
        name: self.info.name,
        avatar: self.info.avatar,
      },
      role: "user",
      content,
      timestamp: Date.now(),
    }
    
    broadcast(chatMessage)
    addChatMessage(chatMessage)
    setInput("")

    // Set presence to thinking
    updateMyPresence({ thinking: true })
    
    try {
      // 1. Call /api/ai/design
      const designRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content, roomId, projectId }),
      });

      if (!designRes.ok) throw new Error("Failed to trigger design generation");
      const { runId } = await designRes.json();

      // 2. Call /api/ai/design/token
      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenRes.ok) throw new Error("Failed to get run token");
      const { token } = await tokenRes.json();

      // 3. Store run state for tracking
      setRunState({ runId, publicToken: token });

      // Broadcast starting status
      const startEvent: AiStatusMessage = {
        type: "ai-status",
        text: "Bright AI is starting...",
        active: true,
        senderId: self?.id || "unknown",
      }
      broadcast(startEvent)
      setLastAiStatus(startEvent)
    } catch (error) {
      console.error("AI Submission Error:", error);
      updateMyPresence({ thinking: false });
      
      // Push error message to chat
      const errorMessage: AiChatMessage = {
        type: "ai-chat",
        sender: {
          id: "system",
          name: "System",
          avatar: undefined,
        },
        role: "ai",
        content: `Error: ${error instanceof Error ? error.message : "Something went wrong. Please try again."}`,
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const starterChips = [
    "Design an e-commerce backend",
    "Create a chat app architecture",
    "Build a CI/CD pipeline",
  ]

  return (
    <aside className={cn(
      "absolute top-0 right-0 bottom-0 z-30 flex w-[340px] flex-col overflow-hidden rounded-2xl border-[1.5px] border-border-subtle bg-bg-surface/95 backdrop-blur-md shadow-2xl transition-all duration-300",
      isOpen ? "translate-x-0 opacity-100" : "translate-x-[calc(100%+24px)] opacity-0 pointer-events-none"
    )}>
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

      <Tabs defaultValue="architect" className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="px-4 pt-4 space-y-4">
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

          {/* AI Status Indicator / Status Strip */}
          {(lastAiStatus || isRunActive) && (
            <div className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] transition-all",
              (lastAiStatus?.active || isRunActive)
                ? "border-accent-ai/20 bg-accent-ai/5 text-accent-ai animate-pulse" 
                : "border-border-subtle bg-bg-subtle text-text-muted"
            )}>
              {(lastAiStatus?.active || isRunActive) ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              <span className="font-medium">
                {isRunActive ? "Processing design..." : (lastAiStatus?.text || "AI is ready")}
              </span>
            </div>
          )}
        </div>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none">
          <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0 px-4 py-4">
            {messages.length === 0 ? (
              /* Empty State */
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
            ) : (
              /* Chat History */
              <div className="space-y-6 pb-4">
                {messages.map((msg, i) => (
                  <div key={i} className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 border border-border-subtle">
                        <AvatarImage src={msg.sender.avatar || undefined} />
                        <AvatarFallback className="text-[8px]">{msg.sender.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-semibold text-text-secondary">{msg.sender.name}</span>
                      <span className="text-[10px] text-text-muted">{format(msg.timestamp, "HH:mm")}</span>
                    </div>
                    <div className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "ai" 
                        ? "bg-bg-subtle text-text-primary border border-border-subtle shadow-sm" 
                        : "bg-accent-ai text-white border border-accent-ai/20 shadow-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border-subtle p-4">
            {/* Status strip shown above input when run is active */}
            {isRunActive && (
              <div className="mb-2 flex items-center gap-2 rounded-md bg-bg-surface border border-border-subtle px-2 py-1.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="flex h-1.5 w-1.5 rounded-full bg-accent-ai animate-pulse" />
                <span className="text-[10px] font-medium text-text-secondary tracking-tight">AI RUN IN PROGRESS</span>
                <div className="ml-auto flex items-center gap-1">
                   <div className="h-1 w-12 overflow-hidden rounded-full bg-bg-subtle">
                      <div className="h-full w-1/2 bg-accent-ai animate-[shimmer_1.5s_infinite_linear]" />
                   </div>
                </div>
              </div>
            )}
            <div className={cn(
              "relative flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/50 p-2 transition-colors",
              isAnyAiActive ? "opacity-50 grayscale-[0.5]" : "focus-within:border-accent-ai/50"
            )}>
              <Textarea
                placeholder={isAnyAiActive ? "AI is working..." : "Ask Bright AI..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnyAiActive}
                className="min-h-[72px] max-h-[160px] w-full resize-none border-0 bg-transparent p-2 text-sm focus-visible:ring-0 disabled:cursor-not-allowed"
              />
              <div className="flex items-center justify-between px-1 pb-1">
                <p className="text-[10px] text-text-faint">
                  {isAnyAiActive ? "Please wait for AI to finish" : "Enter to send, Shift+Enter for newline"}
                </p>
                <Button 
                  size="sm" 
                  className="h-8 w-8 bg-accent-ai text-white hover:bg-accent-ai/90"
                  disabled={!input.trim() || isAnyAiActive}
                  onClick={handleSubmit}
                >
                  {isAnyAiActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none">
          <div className="px-4 pt-4 flex flex-col gap-2 mb-6">
            <Button 
              className="w-full bg-accent-ai text-white hover:bg-accent-ai/90 disabled:opacity-50 transition-all shadow-sm"
              onClick={handleGenerateSpec}
              disabled={isAnyAiActive || isGeneratingSpec}
            >
              {isGeneratingSpec ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Spec
                </>
              )}
            </Button>
            <Button
              className="w-full bg-accent-primary text-white font-semibold hover:bg-accent-primary/90 disabled:opacity-50 transition-all shadow-sm"
              onClick={fetchSpecs}
            >
              Refresh List
            </Button>
          </div>

          <ScrollArea className="flex-1 min-h-0 px-4 pb-4">
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Drafts & Exports</h5>
              
              {specs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="mb-3 h-8 w-8 text-text-faint" />
                  <p className="text-xs text-text-muted">No specifications generated yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {specs.map((spec) => (
                    <div 
                      key={spec.id} 
                      className="group relative flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-elevated p-4 transition-colors hover:border-border-default cursor-pointer"
                      onClick={() => handlePreviewSpec(spec)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-subtle text-text-secondary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-text-primary truncate">{spec.name}</h4>
                            <p className="text-[10px] text-text-muted">
                              Markdown • {format(new Date(spec.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-muted hover:text-accent-ai"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewSpec(spec);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-muted hover:text-accent-ai"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadSpec(spec.id, spec.name);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={!!previewSpec} onOpenChange={(open) => !open && setPreviewSpec(null)}>
        <DialogContent className="!top-[50%] !left-[50%] !-translate-x-1/2 !-translate-y-1/2 max-w-3xl max-h-[85vh] w-[90vw] grid grid-rows-[auto_1fr_auto] p-0 gap-0 overflow-hidden bg-bg-surface border-border-subtle rounded-3xl shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-subtle text-text-secondary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-text-primary tracking-tight truncate">
                  {previewSpec?.name}
                </h2>
                <p className="text-xs text-text-muted">
                  Generated on {previewSpec && format(new Date(previewSpec.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
          
          {/* Body (Scrollable) */}
          <div className="min-h-0 flex flex-col p-6 overflow-hidden">
            <ScrollArea className="h-full rounded-2xl border border-border-subtle bg-bg-elevated/50">
              <div className="p-8">
                {isPreviewLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent-ai" />
                  </div>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-base font-bold text-text-primary mb-3 mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-semibold text-text-primary mb-2 mt-4">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs font-semibold text-text-secondary mb-1.5 mt-3">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 text-text-secondary leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 text-text-secondary">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 text-text-secondary">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ children }) => <code className="font-mono text-xs bg-bg-subtle px-1 py-0.5 rounded text-accent-ai-text">{children}</code>,
                        pre: ({ children }) => <pre className="bg-bg-subtle p-3 rounded-xl mb-2 overflow-x-auto">{children}</pre>,
                        blockquote: ({ children }) => <blockquote className="border-l-2 border-border-subtle pl-3 text-text-muted italic my-2">{children}</blockquote>,
                        strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                      }}
                    >
                      {previewContent}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-border-subtle bg-bg-subtle/50 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-border-subtle bg-bg-surface hover:bg-bg-elevated text-text-primary rounded-xl px-4"
              onClick={() => previewSpec && handleDownloadSpec(previewSpec.id, previewSpec.name)}
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Download Specification</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
