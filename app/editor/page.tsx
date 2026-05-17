import { EditorShell } from "@/components/editor/editor-shell"
import { getProjects } from "@/lib/projects"
import { getClerkIdentity } from "@/lib/project-access"
import { redirect } from "next/navigation"

export default async function EditorPage() {
  const identity = await getClerkIdentity()
  if (!identity) {
    redirect("/sign-in")
  }

  const { owned, shared } = await getProjects(identity)

  return <EditorShell ownedProjects={owned} sharedProjects={shared} />
}
