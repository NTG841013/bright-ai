import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  iconOnly?: boolean
  showText?: boolean
}

export function Logo({ className, iconOnly = false, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
        {/* Stylized "B" icon with architecture/node-link aesthetic */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* Background shape */}
          <rect width="32" height="32" rx="8" fill="var(--accent-primary)" />
          
          {/* Node and path elements inside the "B" */}
          <path
            d="M10 8V24M10 8H18C20.2091 8 22 9.79086 22 12C22 14.2091 20.2091 16 18 16H10M18 16C20.2091 16 22 17.7909 22 20C22 22.2091 20.2091 24 18 24H10"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Decorative "dots" representing architecture nodes */}
          <circle cx="10" cy="8" r="1.5" fill="white" />
          <circle cx="10" cy="16" r="1.5" fill="white" />
          <circle cx="10" cy="24" r="1.5" fill="white" />
          <circle cx="18" cy="8" r="1.5" fill="white" />
          <circle cx="22" cy="12" r="1.5" fill="white" />
          <circle cx="18" cy="16" r="1.5" fill="white" />
          <circle cx="22" cy="20" r="1.5" fill="white" />
          <circle cx="18" cy="24" r="1.5" fill="white" />
        </svg>
      </div>

      {!iconOnly && showText && (
        <span
          className="text-base font-semibold tracking-tight text-text-primary"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Bright AI
        </span>
      )}
    </div>
  )
}
