import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="rounded-full bg-bg-elevated p-6">
          <Lock className="h-12 w-12 text-text-muted" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text-primary">Access Denied</h1>
          <p className="max-w-[400px] text-text-muted">
            You don't have permission to view this project or it doesn't exist.
          </p>
        </div>
        <Button variant="outline" className="p-0">
          <Link href="/editor" className="flex h-full w-full items-center justify-center px-2.5">
            Back to Projects
          </Link>
        </Button>
      </div>
    </div>
  )
}
