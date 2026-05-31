import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess, getClerkIdentity } from "@/lib/project-access";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Verify access to the project using fast-path check
    const project = await checkProjectAccess(projectId);
    if (!project) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // List specs for the project
    const specs = await prisma.projectSpec.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(specs);
  } catch (error) {
    console.error("[SPECS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
