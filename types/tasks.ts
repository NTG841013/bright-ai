import { z } from "zod";

export const AiStatusMessageSchema = z.object({
  type: z.literal("ai-status"),
  text: z.string().optional(),
  active: z.boolean(),
  senderId: z.string(),
  refreshCanvas: z.boolean().optional(),
});

export type AiStatusMessage = z.infer<typeof AiStatusMessageSchema>;

export const AiChatMessageSchema = z.object({
  type: z.literal("ai-chat"),
  sender: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
  }),
  role: z.enum(["user", "ai"]),
  content: z.string(),
  timestamp: z.number(),
});

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>;

export const AiRoomEventSchema = z.discriminatedUnion("type", [
  AiStatusMessageSchema,
  AiChatMessageSchema,
]);

export type AiRoomEvent = z.infer<typeof AiRoomEventSchema>;
