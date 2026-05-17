import { prisma } from "@/lib/prisma"
import { getClerkIdentity } from "./project-access"

export async function getProjects(identityParam?: { userId: string; email: string }) {
  const identity = identityParam || await getClerkIdentity()
  if (!identity) {
    return { owned: [], shared: [] }
  }

  const { userId, email: userEmail } = identity

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    userEmail
      ? prisma.project.findMany({
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
      : Promise.resolve([]),
  ])

  return { owned, shared }
}
