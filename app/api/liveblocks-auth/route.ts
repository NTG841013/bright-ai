import { NextRequest, NextResponse } from "next/server";
import { liveblocks, getUserColor } from "@/lib/liveblocks";
import { checkProjectAccess, getClerkIdentity } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  // 1. Parse room ID from request body
  let room: string;
  try {
    const body = await request.json();
    const roomValue = body.room;

    if (typeof roomValue !== "string") {
      return NextResponse.json({ message: "Invalid room ID" }, { status: 400 });
    }

    room = roomValue.trim();
  } catch (e) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
  
  if (!room) {
    return NextResponse.json({ message: "Missing room ID" }, { status: 400 });
  }

  // 2. Verify project access using fast-path check
  const project = await checkProjectAccess(room);
  if (!project) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 3. Get full identity for Liveblocks userInfo
  const identity = await getClerkIdentity();
  if (!identity) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = identity.userId;
  const name = `${identity.firstName ?? ""} ${identity.lastName ?? ""}`.trim() || "Anonymous";
  const avatar = identity.imageUrl || undefined;
  const color = getUserColor(userId);

  // 4. Ensure the Liveblocks room exists (create if needed) using getOrCreateRoom for atomicity
  // We do this BEFORE preparing the session to ensure the room is there.
  try {
    await liveblocks.getOrCreateRoom(room, {
      defaultAccesses: [], // Private by default, managed by our auth route
    });
  } catch (error) {
    console.error("Error ensuring Liveblocks room exists:", error);
    // Continue anyway, authorize might still work if room was just created or exists
  }

  try {
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name,
        avatar,
        color,
      },
    });

    // Grant the user access to the room
    session.allow(room, session.FULL_ACCESS);

    // Authorize the user and return the result
    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.error("Liveblocks session error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
