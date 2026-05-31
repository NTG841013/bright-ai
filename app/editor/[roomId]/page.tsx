import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getClerkIdentity, checkProjectAccess } from "@/lib/project-access"
import { getProjects } from "@/lib/projects"
import { EditorShell } from "@/components/editor/editor-shell"
import { AccessDenied } from "@/components/editor/access-denied"
import { Room } from "@/components/editor/room"
import { Canvas } from "@/components/editor/canvas"
import { EditorRoomContent } from "@/components/editor/editor-room-content"
import { TriggerAuthContext } from "@trigger.dev/react-hooks"

interface EditorRoomPageProps {
  params: Promise<{ roomId: string }>
}

export default async function EditorRoomPage({ params }: EditorRoomPageProps) {
  const { roomId } = await params
  
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // Fast check: is this the owner? (no currentUser/identity fetch needed yet)
  const project = await checkProjectAccess(roomId)
  if (!project) {
    return (
      <EditorShell ownedProjects={[]} sharedProjects={[]}>
        <AccessDenied />
      </EditorShell>
    )
  }

  // Fetch identity and other projects in parallel to reduce waterfall
  // Both will benefit from React cache() for getClerkIdentity()
  const [identity, projectsData] = await Promise.all([
    getClerkIdentity(),
    getProjects()
  ])

  if (!identity) {
    // This could happen if currentUser() fails during sign-out
    redirect("/sign-in")
  }

  const { owned, shared } = projectsData
  const isOwner = project.ownerId === identity.userId

  return (
    <TriggerAuthContext value={{ accessToken: "" }}>
      <EditorShell 
        ownedProjects={owned} 
        sharedProjects={shared} 
        activeProject={project}
        isOwner={isOwner}
      >
        <Room roomId={roomId}>
          <EditorRoomContent projectId={roomId}>
            <Canvas />
          </EditorRoomContent>
        </Room>
      </EditorShell>
    </TriggerAuthContext>
  )
}
