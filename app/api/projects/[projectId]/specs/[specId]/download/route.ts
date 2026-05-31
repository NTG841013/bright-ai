import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess, getClerkIdentity } from "@/lib/project-access";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  try {
    const identity = await getClerkIdentity();
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId, specId } = await params;

    // Verify access to the project
    const project = await checkProjectAccess(projectId, identity);
    if (!project) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Verify the spec belongs to that project
    const spec = await prisma.projectSpec.findUnique({
      where: {
        id: specId,
      },
    });

    if (!spec || spec.projectId !== projectId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Fetch the file using ProjectSpec.filePath
    // filePath is the URL returned by Vercel Blob put()
    const blobResponse = await get(spec.filePath, { access: "private" });
    if (!blobResponse) {
      return new NextResponse("File Not Found in Storage", { status: 404 });
    }

    // Return it as a downloadable Markdown file
    const headers = new Headers();
    headers.set("Content-Type", "text/markdown; charset=utf-8");
    headers.set("Content-Disposition", `attachment; filename="spec-${specId}.md"`);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Surrogate-Control", "no-store");

    return new NextResponse(blobResponse.stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[SPEC_DOWNLOAD]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
