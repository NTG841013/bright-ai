import { auth } from "@clerk/nextjs/server"
import { EditorShell } from "@/components/editor/editor-shell"
import { getProjects } from "@/lib/projects"
import { redirect } from "next/navigation"

export default async function EditorPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const { owned, shared } = await getProjects()

  return <EditorShell ownedProjects={owned} sharedProjects={shared} />
}
