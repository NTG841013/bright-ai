import { Cpu, Users, FileCode } from "lucide-react"

const features = [
  {
    icon: Cpu,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileCode,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

export function AuthLeftPanel() {
  return (
    <aside className="hidden lg:flex lg:w-1/2 flex-col bg-[var(--bg-surface)] border-r border-[var(--border-default)]">
      <div className="flex flex-col flex-1 px-16 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[var(--accent-primary)]" />
          <span
            className="text-base font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-geist-sans)",
              color: "var(--text-primary)",
              animation: "pulse-brand 2.8s ease-in-out infinite",
            }}
          >
            Bright AI
          </span>
        </div>

        {/* Hero text */}
        <div className="mt-auto mb-auto pt-24 pb-16">
          <h1
            className="text-4xl font-bold leading-tight text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Design systems at the
            <br />
            speed of thought.
          </h1>
          <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-sm">
            Describe your architecture in plain English. Bright AI maps it to a
            shared canvas your whole team can refine in real time.
          </p>

          {/* Feature list */}
          <ul className="mt-10 space-y-6">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)]">
                  <Icon className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-relaxed">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-[var(--text-faint)]">
          © 2026 Bright AI. All rights reserved.
        </p>
      </div>
    </aside>
  )
}
