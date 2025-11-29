import { z } from "zod";

const createIncidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  classification: z.string().min(1, "Classification is required"),
  severity: z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"]),
  date: z.coerce.date(),
  attachmentUrl: z.string().url().optional(),
  description: z.string().optional(),
});

const incidentSchemaQuery = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  severity: z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"]).optional(),
});

const incidentIdParam = z.object({
  incidentId: z.string().uuid("Invalid incident ID"),
});

const updateIncidentSchema = createIncidentSchema.partial();
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentIdParam = z.infer<typeof incidentIdParam>;

export { createIncidentSchema, incidentSchemaQuery };
