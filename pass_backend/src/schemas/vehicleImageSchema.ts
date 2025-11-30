import { z } from "zod";

const createVehicleImageSchema = z.object({
  url: z.string().url("URL must be valid"),
});

const updateVehicleImageSchema = createVehicleImageSchema.partial();

const vehicleImageIdParamSchema = z.object({
  id: z.string().uuid({ message: "O ID da imagem deve ser um UUID válido." }),
});

const vehicleImageQuerySchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  vehicleId: z.string().uuid().optional(),
  url: z.string().optional(),
  sortBy: z.enum(["createdAt", "url"]).default("createdAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type CreateVehicleImageInput = z.infer<typeof createVehicleImageSchema>;
export type UpdateVehicleImageInput = z.infer<typeof updateVehicleImageSchema>;
export type VehicleImageIdParam = z.infer<typeof vehicleImageIdParamSchema>;
export type VehicleImageQueryInput = z.infer<typeof vehicleImageQuerySchema>;

export {
  createVehicleImageSchema,
  updateVehicleImageSchema,
  vehicleImageIdParamSchema,
  vehicleImageQuerySchema,
};
