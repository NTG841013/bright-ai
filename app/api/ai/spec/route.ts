import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess, getClerkIdentity } from "@/lib/project-access";
import { generateSpec } from "@/trigger/generate-spec";

export async function POST(req: Request) {
  try {
    const identity = await getClerkIdentity();
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId, chatHistory, nodes, edges } = await req.json();

    if (!roomId || !chatHistory || !nodes || !edges) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Resolve project access from roomId
    // roomId is the projectId in this system
    const project = await checkProjectAccess(roomId, identity);
    if (!project) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Trigger the task
    const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
      projectId: project.id,
      roomId: roomId,
      chatHistory,
      nodes,
      edges,
    });

    // Create TaskRun record for ownership verification later
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: project.id,
        userId: identity.userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("[SPEC_TRIGGER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
