import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getClerkIdentity(): Promise<{ userId: string; email: string; firstName?: string | null; lastName?: string | null; imageUrl?: string } | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress?.toLowerCase().trim()
  if (!email) return null

  return { 
    userId, 
    email, 
    firstName: user.firstName, 
    lastName: user.lastName, 
    imageUrl: user.imageUrl 
  }
}

export async function checkProjectAccess(projectId: string, identityParam?: { userId: string; email: string }) {
  const identity = identityParam || await getClerkIdentity()
  if (!identity || !identity.email) return null

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
