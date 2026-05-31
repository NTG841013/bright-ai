import { NextResponse } from "next/server";
import { auth as triggerAuth } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { getClerkIdentity } from "@/lib/project-access";

export async function POST(req: Request) {
  try {
    const identity = await getClerkIdentity();
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { runId } = await req.json();
    if (!runId) {
      return new NextResponse("Missing runId", { status: 400 });
    }

    // Verify ownership using TaskRun record
    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
    });

    if (!taskRun || taskRun.userId !== identity.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Generate Trigger.dev public token scoped to that run
    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ token: publicToken });
  } catch (error) {
    console.error("[SPEC_TOKEN]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
