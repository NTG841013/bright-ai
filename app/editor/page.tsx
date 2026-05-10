import { EditorShell } from "@/components/editor/editor-shell"

export default function EditorPage() {
  return (
    <EditorShell>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Select or create a project to get started.</p>
      </div>
    </EditorShell>
  )
}
