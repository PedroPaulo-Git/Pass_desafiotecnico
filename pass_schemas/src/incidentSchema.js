"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentIdParam = exports.updateIncidentSchema = exports.incidentSchemaQuery = exports.createIncidentInputSchema = exports.createIncidentSchema = void 0;
const zod_1 = require("zod");
// Schema for input (before transformation)
const createIncidentInputSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    classification: zod_1.z.string().min(1, "Classification is required"),
    severity: zod_1.z.string().min(1, "Severity is required"),
    date: zod_1.z.coerce.date(),
    attachmentUrl: zod_1.z.string().url().optional(),
    description: zod_1.z.string().optional(),
});
exports.createIncidentInputSchema = createIncidentInputSchema;
// Schema with transformation for backend processing
const createIncidentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    classification: zod_1.z.string().min(1, "Classification is required"),
    severity: zod_1.z
        // 1. Garante que é uma string.
        .string()
        // 2. Transforma a string para MAIÚSCULO.
        .transform((val) => val.toUpperCase())
        // 3. Valida se a string MAIÚSCULA transformada é um dos valores do enum.
        .pipe(zod_1.z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"], {
        message: "Severity must be one of: BAIXA, MEDIA, ALTA, GRAVE",
    })),
    date: zod_1.z.coerce.date(),
    attachmentUrl: zod_1.z.string().url().optional(),
    description: zod_1.z.string().optional(),
});
exports.createIncidentSchema = createIncidentSchema;
const incidentSchemaQuery = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().min(1).default(1),
    limit: zod_1.z.coerce.number().int().positive().min(1).max(100).default(10),
    severity: zod_1.z
        .string()
        .transform((val) => val.toUpperCase())
        .pipe(zod_1.z.enum(["BAIXA", "MEDIA", "ALTA", "GRAVE"], {
        message: "Severity must be one of: BAIXA, MEDIA, ALTA, GRAVE",
    }))
        .optional(),
    sortBy: zod_1.z.enum(["date", "severity"]).default("date").optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
});
exports.incidentSchemaQuery = incidentSchemaQuery;
const incidentIdParam = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid incident ID"),
});
exports.incidentIdParam = incidentIdParam;
const updateIncidentSchema = createIncidentSchema.partial();
exports.updateIncidentSchema = updateIncidentSchema;
