import { prisma } from "@/lib/prisma"
import { getClerkIdentity } from "./project-access"
import { auth } from "@clerk/nextjs/server"

export async function getProjects(identityParam?: { userId: string; email: string }) {
  // Use auth() for fast userId access
  const { userId: currentUserId } = await auth()
  if (!currentUserId) {
    return { owned: [], shared: [] }
  }

  const userId = identityParam?.userId || currentUserId
  const userEmail = identityParam?.email

  // 1. Fetch owned projects (fast, only needs userId)
  const ownedPromise = prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // 2. Fetch shared projects (needs email)
  const sharedPromise = (async () => {
    // If we have email, use it directly
    if (userEmail) {
      return prisma.project.findMany({
        where: {
          collaborators: {
            some: {
              email: userEmail,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    }

    // Otherwise, fetch identity to get email
    const identity = await getClerkIdentity()
    if (!identity?.email) {
      return []
    }

    return prisma.project.findMany({
      where: {
        collaborators: {
          some: {
            email: identity.email,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
  })()

  const [owned, shared] = await Promise.all([ownedPromise, sharedPromise])

  return { owned, shared }
}
