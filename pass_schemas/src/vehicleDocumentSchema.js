"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleDocumentQuerySchema = exports.vehicleDocumentIdParamSchema = exports.updateVehicleDocumentSchema = exports.createVehicleDocumentSchema = void 0;
const zod_1 = require("zod");
// Create schema for vehicle document
const createVehicleDocumentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    expiryDate: zod_1.z.coerce.date(),
    alertDays: zod_1.z.coerce.number().int().min(0, "alertDays must be >= 0").optional(),
    activeAlert: zod_1.z.boolean().optional(),
});
exports.createVehicleDocumentSchema = createVehicleDocumentSchema;
// Update schema (partial)
const updateVehicleDocumentSchema = createVehicleDocumentSchema.partial();
exports.updateVehicleDocumentSchema = updateVehicleDocumentSchema;
// ID param schema
const vehicleDocumentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: "O ID do documento deve ser um UUID válido." }),
});
exports.vehicleDocumentIdParamSchema = vehicleDocumentIdParamSchema;
// Query schema for listing documents
const vehicleDocumentQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().positive().min(1).default(1),
    limit: zod_1.z.coerce.number().int().positive().min(1).max(100).default(10),
    name: zod_1.z.string().min(1, "Name must be at least 1 character").optional(),
    vehicleId: zod_1.z.string().uuid().optional(),
    activeAlert: zod_1.z.coerce.boolean().optional(),
    expiryDateFrom: zod_1.z.coerce.date().optional(),
    expiryDateTo: zod_1.z.coerce.date().optional(),
    expiringWithinDays: zod_1.z.coerce.number().int().positive().optional(),
    sortBy: zod_1.z.enum(["expiryDate", "name", "createdAt"]).default("expiryDate").optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
})
    .superRefine((value, ctx) => {
    if (value.expiryDateFrom && value.expiryDateTo && value.expiryDateFrom > value.expiryDateTo) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "expiryDateFrom must be before expiryDateTo",
            path: ["expiryDateFrom", "expiryDateTo"],
        });
    }
});
exports.vehicleDocumentQuerySchema = vehicleDocumentQuerySchema;
