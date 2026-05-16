import { auth } from "@clerk/nextjs/server";
  import { prisma } from "@/lib/prisma";
  import { NextResponse } from "next/server";

  export async function GET() {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
      const projects = await prisma.project.findMany({
        where: {
          ownerId: userId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return NextResponse.json(projects);
    } catch (error) {
      console.error("[PROJECTS_GET]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }

  export async function POST(req: Request) {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
      const body = await req.json();
      const { name } = body;

      const project = await prisma.project.create({
        data: {
          ownerId: userId,
          name: name || "Untitled Project",
        },
      });

      return NextResponse.json(project);
    } catch (error) {
      console.error("[PROJECTS_POST]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
