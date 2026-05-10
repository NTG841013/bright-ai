import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SignUp } from "@clerk/nextjs"
import { AuthLeftPanel } from "@/components/auth/auth-left-panel"

export default async function SignUpPage() {
  const { userId } = await auth()
  if (userId) redirect("/editor")

  return (
    <div className="flex min-h-screen">
      <AuthLeftPanel />
      <main className="flex flex-1 lg:w-1/2 items-center justify-center px-4 bg-[var(--bg-base)]">
        <SignUp forceRedirectUrl="/editor" />
      </main>
    </div>
  )
}
