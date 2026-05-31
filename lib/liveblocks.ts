import { Liveblocks } from "@liveblocks/node";

const rawSecret = process.env.LIVEBLOCKS_SECRET_KEY;
const secret = rawSecret?.trim();

/**
 * Cached Liveblocks node client
 */
export const liveblocks = secret
  ? new Liveblocks({
      secret,
    })
  : null;

if (!liveblocks && process.env.NODE_ENV === "production") {
  console.warn(
    "Warning: LIVEBLOCKS_SECRET_KEY is missing. Liveblocks features will be disabled."
  );
}

/**
 * Deterministically maps a user ID to a consistent color from a mixed palette.
 */
export function getUserColor(userId: string): string {
  const colors = [
    "#FF5733", // Red-Orange
    "#33FF57", // Green
    "#3357FF", // Blue
    "#F333FF", // Pink/Magenta
    "#FF33A8", // Hot Pink
    "#33FFF6", // Cyan
    "#F6FF33", // Yellow
    "#FF8633", // Orange
    "#8633FF", // Purple
    "#33FF86", // Mint
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
