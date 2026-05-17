import { prisma } from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function getProjects() {
  const { userId } = await auth()
  if (!userId) {
    return { owned: [], shared: [] }
  }

  const user = await currentUser()
  const userEmail = user?.emailAddresses[0]?.emailAddress?.toLowerCase().trim()

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
