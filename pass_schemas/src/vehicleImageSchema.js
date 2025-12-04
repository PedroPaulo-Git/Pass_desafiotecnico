"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleImageQuerySchema = exports.vehicleImageIdParamSchema = exports.updateVehicleImageSchema = exports.createVehicleImageSchema = void 0;
const zod_1 = require("zod");
const createVehicleImageSchema = zod_1.z.object({
    url: zod_1.z.string().url("URL must be valid"),
});
exports.createVehicleImageSchema = createVehicleImageSchema;
const updateVehicleImageSchema = createVehicleImageSchema.partial();
exports.updateVehicleImageSchema = updateVehicleImageSchema;
const vehicleImageIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: "O ID da imagem deve ser um UUID válido." }),
});
exports.vehicleImageIdParamSchema = vehicleImageIdParamSchema;
const vehicleImageQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().min(1).default(1),
    limit: zod_1.z.coerce.number().int().positive().min(1).max(100).default(10),
    vehicleId: zod_1.z.string().uuid().optional(),
    url: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(["createdAt", "url"]).default("createdAt").optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
});
exports.vehicleImageQuerySchema = vehicleImageQuerySchema;
