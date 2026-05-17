import { Liveblocks } from "@liveblocks/node";

const secret = process.env.LIVEBLOCKS_SECRET_KEY;

if (!secret) {
  throw new Error("Missing LIVEBLOCKS_SECRET_KEY environment variable");
}

/**
 * Cached Liveblocks node client
 */
export const liveblocks = new Liveblocks({
  secret,
});

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
