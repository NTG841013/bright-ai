import { redirect } from "next/navigation"
import { getClerkIdentity, checkProjectAccess } from "@/lib/project-access"
import { getProjects } from "@/lib/projects"
import { EditorShell } from "@/components/editor/editor-shell"
import { AccessDenied } from "@/components/editor/access-denied"

interface EditorRoomPageProps {
  params: Promise<{ roomId: string }>
}

export default async function EditorRoomPage({ params }: EditorRoomPageProps) {
  const { roomId } = await params
  
  const identity = await getClerkIdentity()
  if (!identity) {
    redirect("/sign-in")
  }

  const project = await checkProjectAccess(roomId)
  if (!project) {
    return (
      <EditorShell ownedProjects={[]} sharedProjects={[]}>
        <AccessDenied />
      </EditorShell>
    )
  }

  const isOwner = project.ownerId === identity.userId
  const { owned, shared } = await getProjects()

  return (
    <EditorShell 
      ownedProjects={owned} 
      sharedProjects={shared} 
      activeProject={project}
      isOwner={isOwner}
    >
      <div className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden bg-bg-base">
        {/* Background Grid & Gradient */}
        <div 
          className="absolute inset-0 z-0 opacity-30" 
          style={{ 
            backgroundImage: `radial-gradient(circle at center, transparent 0%, var(--bg-base) 100%), 
                             linear-gradient(var(--border-default) 1px, transparent 1px), 
                             linear-gradient(90deg, var(--border-default) 1px, transparent 1px)`,
            backgroundSize: "100% 100%, 40px 40px, 40px 40px",
            backgroundPosition: "0 0, 20px 20px, 20px 20px"
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface text-accent-primary shadow-lg">
            <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
              Workspace Shell
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
              Canvas and collaboration tooling land here<br />next.
            </h1>
          </div>
          
          <p className="max-w-[460px] text-sm leading-relaxed text-text-muted">
            This room is ready for the shared architecture canvas, durable AI workflows, and real-time presence. For now, the shell is wired with project context and navigation only.
          </p>
        </div>
        
        {/* Decorative elements to mimic the screenshot */}
        <div className="absolute bottom-4 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-border-subtle" />
      </div>
    </EditorShell>
  )
}
