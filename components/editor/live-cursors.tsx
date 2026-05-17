"use client"

import { useOthers } from "@liveblocks/react/suspense"

export function LiveCursors() {
  const others = useOthers()

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence.cursor) return null

        return (
          <Cursor
            key={connectionId}
            color={info.color}
            x={presence.cursor.x}
            y={presence.cursor.y}
            name={info.name}
          />
        )
      })}
    </>
  )
}

function Cursor({ color, x, y, name }: { color: string; x: number; y: number; name: string }) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-[100]"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 16 16"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.5 1.5V12.5L4.5 9.5L7.5 15.5L9.5 14.5L6.5 8.5H12.5L1.5 1.5Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="ml-4 rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}
