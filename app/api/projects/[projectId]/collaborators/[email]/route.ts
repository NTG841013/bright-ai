import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; email: string }> }
) {
  const { projectId, email } = await params
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // Only owner can remove collaborators
  if (project.ownerId !== userId) {
    return new NextResponse("Forbidden: Only owners can remove collaborators", { status: 403 })
  }

  try {
    await prisma.projectCollaborator.delete({
      where: {
        projectId_email: {
          projectId,
          email: decodeURIComponent(email),
        },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error removing collaborator:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
