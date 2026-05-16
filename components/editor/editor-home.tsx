import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditorHomeProps {
  onNewProject: () => void
}

export function EditorHome({ onNewProject }: EditorHomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-xl font-semibold text-text-primary">
          Create a project or open an existing one
        </h2>
        <p className="text-sm text-text-muted">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
      </div>
      <Button
        onClick={onNewProject}
        className="gap-2 rounded-full bg-accent-primary px-5 text-white hover:bg-accent-primary/90 border-0"
      >
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </div>
  )
}
