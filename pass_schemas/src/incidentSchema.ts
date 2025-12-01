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
    .pipe(z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"], {
        invalid_type_error: "Severity must be one of: BAIXA, MEDIA, ALTA, GRAVE",
        required_error: "Severity is required",
    })),
  date: z.coerce.date(),
  attachmentUrl: z.string().url().optional(),
  description: z.string().optional(),
});

const incidentSchemaQuery = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  severity: z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"]).transform((val) => val.toUpperCase()).pipe(z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"], {
        invalid_type_error: "Severity must be one of: BAIXA, MEDIA, ALTA, GRAVE",
        required_error: "Severity is required",
    })).optional(),
  sortBy: z
    .enum(["date", "severity"])
    .default("date")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

const incidentIdParam = z.object({
  id: z.string().uuid("Invalid incident ID"),
});

const updateIncidentSchema = createIncidentSchema.partial();

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentIdParam = z.infer<typeof incidentIdParam>;

export { createIncidentSchema, incidentSchemaQuery, updateIncidentSchema, incidentIdParam };
