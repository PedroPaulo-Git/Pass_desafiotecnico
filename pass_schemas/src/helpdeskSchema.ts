import { z } from "zod";

export const helpdeskCategorySchema = z.enum(["BUG", "AGENDAMENTO", "TREINAMENTO", "PERFORMANCE", "AJUSTE_MELHORIA", "OUTRO"]);

export const helpdeskPrioritySchema = z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]);

export const helpdeskStatusSchema = z.enum(["ABERTO", "EM_ANALISE", "EM_ANDAMENTO", "AGUARDANDO_USUARIO", "RESOLVIDO", "ENCERRADO"]);

export const helpdeskModuleSchema = z.enum(["AGENDAMENTO", "TREINAMENTOS", "FINANCEIRO", "USUARIOS"]);

export const helpdeskEnvironmentSchema = z.enum(["WEB", "MOBILE"]);

export const createHelpdeskSchema = z.object({
  clientId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: helpdeskCategorySchema,
  priority: helpdeskPrioritySchema.default("BAIXA"),
  module: helpdeskModuleSchema.optional(),
  environment: helpdeskEnvironmentSchema.default("WEB"),
  attachments: z.array(z.string().url()).optional(), // URLs dos anexos iniciais
});

export const updateHelpdeskSchema = z.object({
  assignedUserId: z.string().uuid().optional(),
  status: helpdeskStatusSchema.optional(),
  priority: helpdeskPrioritySchema.optional(),
});

export const helpdeskQuerySchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "lastMessageAt", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: helpdeskStatusSchema.optional(),
  priority: helpdeskPrioritySchema.optional(),
  category: helpdeskCategorySchema.optional(),
  clientId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
});

export const helpdeskSchema = z.object({
  id: z.string().uuid(),
  ticketNumber: z.string().nullable(),
  clientId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  assignedUserId: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string(),
  category: helpdeskCategorySchema,
  priority: helpdeskPrioritySchema,
  status: helpdeskStatusSchema,
  module: helpdeskModuleSchema.nullable(),
  environment: helpdeskEnvironmentSchema,
  bucketPath: z.string(),
  lastMessageAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
});

export type CreateHelpdeskInput = z.infer<typeof createHelpdeskSchema>;
export type UpdateHelpdeskInput = z.infer<typeof updateHelpdeskSchema>;
export type HelpdeskQuery = z.infer<typeof helpdeskQuerySchema>;
export type Helpdesk = z.infer<typeof helpdeskSchema>;