import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { liveblocks, getUserColor } from "@/lib/liveblocks";
import { checkProjectAccess } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  // 1. Require Clerk authentication & verify project access
  // Using the project ID (roomId) from the request body as specified
  let room: string;
  try {
    const body = await request.json();
    const roomValue = body.room;

    if (typeof roomValue !== "string") {
      return new NextResponse("Invalid room ID", { status: 400 });
    }

    room = roomValue.trim();
  } catch (e) {
    return new NextResponse("Invalid request body", { status: 400 });
  }
  
  if (!room) {
    return new NextResponse("Missing room ID", { status: 400 });
  }

  // 2. Verify project access using the existing access helper
  // The helper also ensures the user is authenticated via Clerk
  const project = await checkProjectAccess(room);

  if (!project) {
    // Return 403 for unauthorized project access as specified
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Get user details from Clerk
  const user = await currentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const userId = user.id;
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Anonymous";
  const avatar = user.imageUrl;
  const color = getUserColor(userId);

  // 3. Ensure the Liveblocks room exists (create if needed) using getOrCreateRoom for atomicity
  try {
    await liveblocks.getOrCreateRoom(room, {
      defaultAccesses: [], // Private by default, managed by our auth route
    });
  } catch (error) {
    console.error("Error ensuring Liveblocks room exists:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
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
    // Since we verified access via checkProjectAccess, we allow FULL access here
    session.allow(room, session.FULL_ACCESS);

    // Authorize the user and return the result
    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.error("Liveblocks session error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
