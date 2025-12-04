"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleSchemaQuery = exports.vehicleIdParamSchema = exports.updateVehicleSchema = exports.createVehicleSchema = void 0;
const zod_1 = require("zod");
const BRAZIL_PLATE_REGEX = /^(?:[A-Z]{3}\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/;
const createVehicleSchema = zod_1.z.object({
    internalId: zod_1.z.string().min(1, "Internal ID").optional(),
    plate: zod_1.z
        .string()
        .transform((val) => val.replace(/[-\s]/g, "").toUpperCase())
        .refine((v) => BRAZIL_PLATE_REGEX.test(v), {
        message: "Plate must be a valid Brazilian plate (examples: ABC1234 or ABC1C23).",
    }),
    chassis: zod_1.z
        .string()
        .length(17, "Chassi must be exactly 17 characters")
        .optional(),
    renavam: zod_1.z
        .string()
        .length(11, "RENAVAM must be exactly 11 characters")
        .optional(),
    brand: zod_1.z.string().min(1, "Brand is required"),
    model: zod_1.z.string().min(1, "Model is required"),
    color: zod_1.z.string().min(1, "Color").optional(),
    year: zod_1.z.number().min(1886, "Year must be 1886 or later"),
    doors: zod_1.z.number().min(1, "Doors must be at least 1"),
    capacity: zod_1.z.number().min(1, "Capacity must be at least 1"),
    fuelType: zod_1.z.enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"]),
    category: zod_1.z.enum(["ONIBUS", "VAN", "CARRO", "CAMINHAO"]),
    classification: zod_1.z.enum(["PREMIUM", "BASIC", "EXECUTIVO"]),
    state: zod_1.z.string().length(2, "State must be exactly 2 characters").optional(),
    status: zod_1.z
        .enum(["LIBERADO", "EM_MANUTENCAO", "VENDIDO", "INDISPONIVEL"])
        .optional(),
    currentKm: zod_1.z.number().min(0, "Current KM must be non-negative").optional(),
    companyName: zod_1.z.string().min(1, "Company Name").optional(),
    description: zod_1.z.string().min(1, "Description").optional(),
});
exports.createVehicleSchema = createVehicleSchema;
const vehicleSchemaQuery = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().min(1).default(1),
    limit: zod_1.z.coerce.number().int().positive().min(1).max(100).default(10),
    plate: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? v.replace(/[-\s]/g, "").toUpperCase() : v))
        .refine((v) => !v || BRAZIL_PLATE_REGEX.test(v), {
        message: "Plate must be a valid Brazilian plate when provided (examples: ABC1234 or ABC1C23).",
    }),
    brand: zod_1.z.string().min(1, "Brand is required").optional(),
    model: zod_1.z.string().min(1, "Model is required").optional(),
    status: zod_1.z
        .enum(["LIBERADO", "EM_MANUTENCAO", "VENDIDO", "INDISPONIVEL"])
        .optional(),
    category: zod_1.z.enum(["ONIBUS", "VAN", "CARRO", "CAMINHAO"]).optional(),
    classification: zod_1.z.enum(["PREMIUM", "BASIC", "EXECUTIVO"]).optional(),
    state: zod_1.z.string().length(2, "State must be exactly 2 characters").optional(),
    sortBy: zod_1.z
        .enum([
        "createdAt",
        "brand",
        "plate",
        "model",
        "year",
        "status",
        "currentKm"
    ])
        .default("createdAt")
        .optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
});
exports.vehicleSchemaQuery = vehicleSchemaQuery;
const updateVehicleSchema = createVehicleSchema.partial();
exports.updateVehicleSchema = updateVehicleSchema;
const vehicleIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: "O ID do veículo deve ser um UUID válido." }),
});
exports.vehicleIdParamSchema = vehicleIdParamSchema;
