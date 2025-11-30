import { z } from "zod";

const createVehicleSchema = z.object({
  internalId: z.string().min(1, "Internal ID").optional(),
  plate: z
    .string()
    .transform((val) => val.replace(/-/g, "").toUpperCase())
    .refine((v) => v.length === 7, {
      message: "Plate must be exactly 7 characters, (Ex: ABC1C23).",
    }),
  chassis: z
    .string()
    .length(17, "Chassi must be exactly 17 characters")
    .optional(),
  renavam: z
    .string()
    .length(11, "RENAVAM must be exactly 11 characters")
    .optional(),

  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color").optional(),
  year: z.number().min(1886, "Year must be 1886 or later"),
  doors: z.number().min(1, "Doors must be at least 1"),
  capacity: z.number().min(1, "Capacity must be at least 1"),

  fuelType: z.enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"]),
  category: z.enum(["ONIBUS", "VAN", "CARRO", "CAMINHAO"]),
  classification: z.enum(["PREMIUM", "BASIC", "EXECUTIVO"]),

  state: z.string().length(2, "State must be exactly 2 characters").optional(),
  status: z
    .enum(["LIBERADO", "EM_MANUTENCAO", "VENDIDO", "INDISPONIVEL"])
    .optional(),
  currentKm: z.number().min(0, "Current KM must be non-negative").optional(),

  companyName: z.string().min(1, "Company Name").optional(),
  description: z.string().min(1, "Description").optional(),
});

const vehicleSchemaQuery = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  plate: z.string().min(7, "Plate is required").optional(),
  brand: z.string().min(1, "Brand is required").optional(),
  status: z
    .enum(["LIBERADO", "EM_MANUTENCAO", "VENDIDO", "INDISPONIVEL"])
    .optional(),
  category: z.enum(["ONIBUS", "VAN", "CARRO", "CAMINHAO"]).optional(),
  classification: z.enum(["PREMIUM", "BASIC", "EXECUTIVO"]).optional(),
  state: z.string().length(2, "State must be exactly 2 characters").optional(),
  sortBy: z
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
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

const updateVehicleSchema = createVehicleSchema.partial();

const vehicleIdParamSchema = z.object({
  id: z.string().uuid({ message: "O ID do veículo deve ser um UUID válido." }),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleIdParam = z.infer<typeof vehicleIdParamSchema>;
export type VehicleQueryInput = z.infer<typeof vehicleSchemaQuery>;

export {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
  vehicleSchemaQuery,
};
