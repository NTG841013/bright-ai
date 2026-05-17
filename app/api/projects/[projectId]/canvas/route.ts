import { NextResponse } from "next/server"
import { put, get } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess, getClerkIdentity } from "@/lib/project-access"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const identity = await getClerkIdentity()
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { projectId } = await params
    const project = await checkProjectAccess(projectId, identity)

    if (!project) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const canvasData = await request.json()
    const fileName = `projects/${projectId}/canvas.json`
    
    // Upload JSON to Vercel Blob
    const blob = await put(fileName, JSON.stringify(canvasData), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: true, // Good for cache busting if needed, but we store the URL
    })

    // Update Prisma with the blob URL
    await prisma.project.update({
      where: { id: projectId },
      data: {
        canvasJsonPath: blob.url,
      },
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[CANVAS_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const identity = await getClerkIdentity()
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { projectId } = await params
    const project = await checkProjectAccess(projectId, identity)

    if (!project) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!project.canvasJsonPath) {
      return NextResponse.json({ nodes: [], edges: [] })
    }

    // Fetch the JSON from Vercel Blob
    const blobResponse = await get(project.canvasJsonPath, { access: "private" })
    if (!blobResponse) {
      throw new Error("Blob not found")
    }
    const canvasData = await new Response(blobResponse.stream).json()
    return NextResponse.json(canvasData)
  } catch (error) {
    console.error("[CANVAS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
