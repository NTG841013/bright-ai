import { redirect } from "next/navigation"
import { getClerkIdentity, checkProjectAccess } from "@/lib/project-access"
import { getProjects } from "@/lib/projects"
import { EditorShell } from "@/components/editor/editor-shell"
import { AccessDenied } from "@/components/editor/access-denied"
import { Room } from "@/components/editor/room"
import { Canvas } from "@/components/editor/canvas"

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
      <Room roomId={roomId}>
        <Canvas />
      </Room>
    </EditorShell>
  )
}
