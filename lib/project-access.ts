import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getClerkIdentity() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

  return { userId, email }
}

export async function checkProjectAccess(projectId: string) {
  const identity = await getClerkIdentity()
  if (!identity) return null

  const { userId, email } = identity

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: {
        where: { email },
      },
    },
  })

  if (!project) return null

  // Check if owner or collaborator
  const isOwner = project.ownerId === userId
  const isCollaborator = project.collaborators.length > 0

  if (!isOwner && !isCollaborator) return null

  return project
}
