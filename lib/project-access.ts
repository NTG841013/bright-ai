import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { headers } from "next/headers"

export const getClerkIdentity = cache(async function getClerkIdentity(): Promise<{ userId: string; email: string; firstName?: string | null; lastName?: string | null; imageUrl?: string } | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    console.warn("getClerkIdentity: No userId found in auth()");
    return null;
  }

  // 1. Try to get email from session claims first (extremely fast, no network request)
  // This works if you've added "email" to the session token in Clerk Dashboard (Settings -> Sessions -> Edit Token)
  const emailFromClaims = sessionClaims?.email as string | undefined;
  
  if (emailFromClaims) {
    return {
      userId,
      email: emailFromClaims.toLowerCase().trim(),
      firstName: (sessionClaims?.firstName || sessionClaims?.given_name) as string || null,
      lastName: (sessionClaims?.lastName || sessionClaims?.family_name) as string || null,
      imageUrl: (sessionClaims?.imageUrl || sessionClaims?.picture) as string || undefined,
    }
  }

  // OPTIMIZATION: If we are in a Server Action (POST) and email is missing from claims,
  // we skip the slow currentUser() path to prevent hangs during sign-out re-renders.
  // NOTE: This may result in limited functionality for collaborators in some actions
  // until "email" is added to the Clerk session token.
  try {
    const h = await headers();
    if (h.get("next-action")) {
      console.log("getClerkIdentity: Skipping slow path during Server Action to prevent hang");
      return {
        userId,
        email: "", 
        firstName: (sessionClaims?.firstName || sessionClaims?.given_name) as string || null,
        lastName: (sessionClaims?.lastName || sessionClaims?.family_name) as string || null,
        imageUrl: (sessionClaims?.imageUrl || sessionClaims?.picture) as string || undefined,
      };
    }
  } catch (e) {
    // headers() might throw in some contexts, ignore
  }

  try {
    // 2. Fallback to currentUser() only if email is NOT in claims
    // This is the slow path (1s+ latency)
    const user = await currentUser()
    if (!user) {
      console.warn("getClerkIdentity: No user found in currentUser()");
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress?.toLowerCase().trim()
    if (!email) {
      console.warn("getClerkIdentity: No email found for user", userId);
      return null;
    }

    return { 
      userId, 
      email, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      imageUrl: user.imageUrl 
    }
  } catch (error) {
    console.error("getClerkIdentity: Error fetching currentUser", error);
    return null;
  }
})

export async function checkProjectAccess(projectId: string, identityParam?: { userId: string; email: string }) {
  const { userId } = await auth()
  if (!userId) return null

  // 1. Fetch project first to check ownership (fast, no currentUser needed)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) return null

  // 2. If owner, we can return immediately without fetching full Clerk identity
  if (project.ownerId === userId) {
    return project
  }

  // 3. If not owner, we need the email to check collaborators (requires currentUser)
  const identity = identityParam || await getClerkIdentity()
  if (!identity || !identity.email) return null

  const email = identity.email

  // Check if collaborator (already fetched project but we need to check collaborators)
  const collaborator = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_email: {
        projectId,
        email,
      },
    },
  })

  if (!collaborator) return null

  return project
}
