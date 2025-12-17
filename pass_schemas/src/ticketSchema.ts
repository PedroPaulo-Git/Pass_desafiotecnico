import { z } from "zod";

export const createTicketSchema = z.object({
  clientUuid: z.string().uuid(),
  title: z.string().optional(),
});

export const ticketSchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullable(),
  status: z.string(),
  clientUuid: z.string().uuid(),
  createdAt: z.string(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type Ticket = z.infer<typeof ticketSchema>;
