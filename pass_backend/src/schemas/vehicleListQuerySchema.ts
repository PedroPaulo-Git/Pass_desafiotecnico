import { z } from "zod";

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
});
export { vehicleSchemaQuery };
export type VehicleQueryInput = z.infer<typeof vehicleSchemaQuery>;
