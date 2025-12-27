import { z } from "zod";

export const messageBucketSchema = z.object({
  authorId: z.string().uuid(),
  authorType: z.enum(["user", "support"]),
  message: z.string().min(1),
  createdAt: z.string().datetime(),
  attachments: z.array(z.string()).optional(), // Caminhos relativos dos anexos no bucket
});

// Schema para criação de mensagens (sem createdAt, que é gerado automaticamente)
export const createMessageSchema = z.object({
  authorId: z.string().uuid(),
  authorType: z.enum(["user", "support"]),
  message: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

export type MessageBucket = z.infer<typeof messageBucketSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;