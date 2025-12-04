"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fuelingSchemaQuery = exports.fuelingIdParamSchema = exports.updateFuelingSchema = exports.createFuelingSchema = void 0;
const zod_1 = require("zod");
const createFuelingSchema = zod_1.z.object({
    provider: zod_1.z.string().min(1, "Provider is required"),
    date: zod_1.z.coerce.date(),
    odometer: zod_1.z.number().min(0, "Odometer must be non-negative"),
    fuelType: zod_1.z.enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"]),
    liters: zod_1.z.number().min(0, "Liters must be non-negative"),
    unitPrice: zod_1.z.number().min(0, "Unit price must be non-negative"),
    totalValue: zod_1.z.number().min(0, "Total must be non-negative").optional(),
    notes: zod_1.z.string().optional(),
});
exports.createFuelingSchema = createFuelingSchema;
const fuelingSchemaQuery = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().positive().min(1).default(1),
    limit: zod_1.z.coerce.number().int().positive().min(1).max(100).default(10),
    provider: zod_1.z
        .string()
        .min(1, "Provider must be at least 1 character")
        .optional(),
    fuelType: zod_1.z
        .enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"])
        .optional(),
    dateFrom: zod_1.z.coerce.date().optional(),
    dateTo: zod_1.z.coerce.date().optional(),
    minOdometer: zod_1.z.coerce
        .number()
        .min(0, "Odometer must be non-negative")
        .optional(),
    maxOdometer: zod_1.z.coerce
        .number()
        .min(0, "Odometer must be non-negative")
        .optional(),
    minLiters: zod_1.z.coerce
        .number()
        .min(0, "Liters must be non-negative")
        .optional(),
    maxLiters: zod_1.z.coerce
        .number()
        .max(1000000, "Liters must be less than or equal to 1000000")
        .optional(),
    minUnitPrice: zod_1.z.coerce
        .number()
        .min(0, "Unit price must be non-negative")
        .optional(),
    maxUnitPrice: zod_1.z.coerce
        .number()
        .min(0, "Unit price must be non-negative")
        .optional(),
    totalValue: zod_1.z.coerce
        .number()
        .min(0, "Total must be non-negative")
        .optional(),
    sortBy: zod_1.z
        .enum(["date", "odometer", "liters", "unitPrice", "totalValue"])
        .default("date")
        .optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
})
    .superRefine((value, ctx) => {
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "dateFrom must be before dateTo",
            path: ["dateFrom", "dateTo"],
        });
    }
    if (value.minOdometer !== undefined &&
        value.maxOdometer !== undefined &&
        value.minOdometer > value.maxOdometer) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "minOdometer must be less than or equal to maxOdometer",
            path: ["minOdometer", "maxOdometer"],
        });
    }
    if (value.minLiters !== undefined &&
        value.maxLiters !== undefined &&
        value.minLiters > value.maxLiters) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "minLiters must be less than or equal to maxLiters",
            path: ["minLiters", "maxLiters"],
        });
    }
    if (value.minUnitPrice !== undefined &&
        value.maxUnitPrice !== undefined &&
        value.minUnitPrice > value.maxUnitPrice) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "minUnitPrice must be less than or equal to maxUnitPrice",
            path: ["minUnitPrice", "maxUnitPrice"],
        });
    }
});
exports.fuelingSchemaQuery = fuelingSchemaQuery;
const updateFuelingSchema = createFuelingSchema.partial();
exports.updateFuelingSchema = updateFuelingSchema;
const fuelingIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .uuid({ message: "O ID do abastecimento deve ser um UUID válido." }),
});
exports.fuelingIdParamSchema = fuelingIdParamSchema;
