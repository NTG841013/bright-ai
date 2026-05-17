"use client"

import { useOthers, useSelf } from "@liveblocks/react/suspense"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

export function PresenceAvatars() {
  const others = useOthers()
  const self = useSelf()

  // Filter others to ensure we don't include the current user (though Liveblocks should handle this, 
  // the spec explicitly asks to filter to exclude any entry whose user ID matches the current Clerk user ID)
  const collaborators = others.filter((other) => other.id !== self?.id)
  
  const hasCollaborators = collaborators.length > 0
  const displayCollaborators = collaborators.slice(0, 5)
  const overflowCount = collaborators.length - 5

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
      <div className="flex items-center">
        {hasCollaborators && (
          <div className="flex -space-x-2 mr-4">
            {displayCollaborators.map((other) => (
              <div
                key={other.id}
                className="relative h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-bg-surface ring-1 ring-white/10 overflow-hidden"
                title={other.info.name}
              >
                {other.info.avatar ? (
                  <img
                    src={other.info.avatar}
                    alt={other.info.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div 
                    className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: other.info.color }}
                  >
                    {other.info.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
              </div>
            ))}
            {overflowCount > 0 && (
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-bg-elevated ring-1 ring-white/10 text-[10px] font-bold text-text-primary">
                +{overflowCount}
              </div>
            )}
          </div>
        )}

        {hasCollaborators && (
          <div className="h-4 w-[1px] bg-border-subtle mr-4" />
        )}

        <div className="h-8 w-8 rounded-full ring-1 ring-white/10 flex items-center justify-center">
          <UserButton 
             appearance={{
                elements: {
                    userButtonAvatarBox: "h-8 w-8"
                }
             }}
          />
        </div>
      </div>
    </div>
  )
}
