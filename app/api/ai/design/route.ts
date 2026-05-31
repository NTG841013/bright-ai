import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess, getClerkIdentity } from "@/lib/project-access";
import { designTask } from "@/trigger/design-agent";

export async function POST(req: Request) {
  try {
    const identity = await getClerkIdentity();
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt, roomId, projectId } = await req.json();

    if (!prompt || !roomId || !projectId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify project access
    const project = await checkProjectAccess(projectId, identity);
    if (!project) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Trigger the task
    const handle = await tasks.trigger<typeof designTask>("design-agent", {
      prompt,
      roomId,
      projectId,
    });

    // Create TaskRun record
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: project.id,
        userId: identity.userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("[DESIGN_TRIGGER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
