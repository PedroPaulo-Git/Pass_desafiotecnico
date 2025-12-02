import { z } from "zod";

const createIncidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  classification: z.string().min(1, "Classification is required"),
  severity: z
    // 1. Garante que é uma string.
    .string()
    // 2. Transforma a string para MAIÚSCULO.
    .transform((val) => val.toUpperCase())
    // 3. Valida se a string MAIÚSCULA transformada é um dos valores do enum.
    .pipe(
      z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"] as const, {
        message: "Severity must be one of: BAIXA, MEDIA, ALTA, GRAVE",
      })
    ),
  date: z.coerce.date(),
  attachmentUrl: z.string().url().optional(),
  description: z.string().optional(),
});

const incidentSchemaQuery = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  severity: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(
      z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"] as const, {
        message: "Severity must be one of: BAIXA, MEDIA, ALTA, GRAVE",
      })
    )
    .optional(),
  sortBy: z.enum(["date", "severity"] as const).default("date").optional(),
  sortOrder: z.enum(["asc", "desc"] as const).default("desc").optional(),
});

const incidentIdParam = z.object({
  id: z.string().uuid("Invalid incident ID"),
});

const updateIncidentSchema = createIncidentSchema.partial();

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentIdParam = z.infer<typeof incidentIdParam>;

export { createIncidentSchema, incidentSchemaQuery, updateIncidentSchema, incidentIdParam };
