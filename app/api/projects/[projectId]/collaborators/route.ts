import { NextResponse } from "next/server"
import { auth, createClerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: {
        orderBy: {
          email: "asc",
        },
      },
    },
  })

  if (!project) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // Check access: must be owner or a collaborator
  // We need current user's email to check collaborator status
  const clerkUser = await clerk.users.getUser(userId)
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase().trim()

  const isOwner = project.ownerId === userId
  const isCollaborator = project.collaborators.some((c) => c.email.toLowerCase().trim() === userEmail)

  if (!isOwner && !isCollaborator) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Enrich collaborators with Clerk data
  const enrichedCollaborators = await Promise.all(
    project.collaborators.map(async (collab) => {
      try {
        const response = await clerk.users.getUserList({
          emailAddress: [collab.email],
          limit: 1,
        })

        const user = response.data[0]
        if (user) {
          return {
            email: collab.email,
            name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
            imageUrl: user.imageUrl,
            isClerkUser: true,
            role: "COLLABORATOR",
          }
        }
      } catch (error) {
        console.error(`Error fetching Clerk user for ${collab.email}:`, error)
      }

      return {
        email: collab.email,
        name: null,
        imageUrl: null,
        isClerkUser: false,
        role: "COLLABORATOR",
      }
    })
  )

  // Fetch and enrich owner data
  let enrichedOwner = null
  try {
    const ownerUser = await clerk.users.getUser(project.ownerId)
    enrichedOwner = {
      email: ownerUser.emailAddresses[0]?.emailAddress || "",
      name: `${ownerUser.firstName ?? ""} ${ownerUser.lastName ?? ""}`.trim() || null,
      imageUrl: ownerUser.imageUrl,
      isClerkUser: true,
      role: "OWNER",
    }
  } catch (error) {
    console.error(`Error fetching owner data for ${project.ownerId}:`, error)
  }

  return NextResponse.json({
    owner: enrichedOwner,
    collaborators: enrichedCollaborators,
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { email } = await req.json()
  if (!email || typeof email !== "string") {
    return new NextResponse("Email is required", { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (project.ownerId !== userId) {
    return new NextResponse("Forbidden: Only owners can invite collaborators", { status: 403 })
  }

  // Don't add owner as collaborator
  const owner = await clerk.users.getUser(userId)
  if (owner.emailAddresses.some(e => e.emailAddress.toLowerCase().trim() === normalizedEmail)) {
    return new NextResponse("Owner cannot be added as a collaborator", { status: 400 })
  }

  try {
    const collaborator = await prisma.projectCollaborator.upsert({
      where: {
        projectId_email: {
          projectId,
          email: normalizedEmail,
        },
      },
      update: {}, // Do nothing if already exists
      create: {
        projectId,
        email: normalizedEmail,
      },
    })

    return NextResponse.json(collaborator)
  } catch (error) {
    console.error("Error adding collaborator:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
