import {z} from "zod";

// Create schema for vehicle document
const createVehicleDocumentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  expiryDate: z.coerce.date(),
  alertDays: z.coerce.number().int().min(0, "alertDays must be >= 0").optional(),
  activeAlert: z.boolean().optional(),
});

// Update schema (partial)
const updateVehicleDocumentSchema = createVehicleDocumentSchema.partial();

// ID param schema
const vehicleDocumentIdParamSchema = z.object({
  id: z.string().uuid({ message: "O ID do documento deve ser um UUID válido." }),
});

// Query schema for listing documents
const vehicleDocumentQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().min(1).default(1),
    limit: z.coerce.number().int().positive().min(1).max(100).default(10),
    name: z.string().min(1, "Name must be at least 1 character").optional(),
    vehicleId: z.string().uuid().optional(),
    activeAlert: z.coerce.boolean().optional(),
    expiryDateFrom: z.coerce.date().optional(),
    expiryDateTo: z.coerce.date().optional(),
    expiringWithinDays: z.coerce.number().int().positive().optional(),
    sortBy: z.enum(["expiryDate", "name", "createdAt"]).default("expiryDate").optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.expiryDateFrom && value.expiryDateTo && value.expiryDateFrom > value.expiryDateTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "expiryDateFrom must be before expiryDateTo",
        path: ["expiryDateFrom", "expiryDateTo"],
      });
    }
  });

export {
  createVehicleDocumentSchema,
  updateVehicleDocumentSchema,
  vehicleDocumentIdParamSchema,
  vehicleDocumentQuerySchema,
};

export type CreateVehicleDocumentInput = z.infer<typeof createVehicleDocumentSchema>;
export type UpdateVehicleDocumentInput = z.infer<typeof updateVehicleDocumentSchema>;
export type VehicleDocumentIdParam = z.infer<typeof vehicleDocumentIdParamSchema>;
export type VehicleDocumentQueryInput = z.infer<typeof vehicleDocumentQuerySchema>;
