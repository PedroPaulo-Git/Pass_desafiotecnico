import { z } from "zod";

export const createMessageSchema = z.object({
  ticketId: z.string().uuid(),
  senderUuid: z.string().uuid(),
  role: z.enum(["agent", "client"]),
  content: z.string().min(1),
});

export const messageSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  senderUuid: z.string().uuid(),
  role: z.enum(["agent", "client"]),
  content: z.string(),
  createdAt: z.string(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type Message = z.infer<typeof messageSchema>;
