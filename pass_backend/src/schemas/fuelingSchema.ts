import { z } from "zod";

const createFuelingSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  date: z.coerce.date(),
  odometer: z.number().min(0, "Odometer must be non-negative"),
  fuelType: z.enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"]),
  liters: z.number().min(0, "Liters must be non-negative"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalValue: z.number().min(0, "Total must be non-negative"),
  notes: z.string().optional(),
});

const fuelingSchemaQuery = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  fueltype: z
    .enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"])
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minOdometer: z.number().min(0, "Odometer must be non-negative").optional(),
  maxOdometer: z.number().min(0, "Odometer must be non-negative").optional(),
  minLiters: z.number().min(0, "Liters must be non-negative").optional(),
  maxLiters: z
    .number()
    .max(1000000, "Liters must be less than or equal to 1000000")
    .optional(),
});
const updateFuelingSchema = createFuelingSchema.partial();

const fuelingIdParamSchema = z.object({
  id: z
    .string()
    .uuid({ message: "O ID do abastecimento deve ser um UUID válido." }),
});

export type CreateFuelingInput = z.infer<typeof createFuelingSchema>;
export type UpdateFuelingInput = z.infer<typeof updateFuelingSchema>;
export type FuelingIdParam = z.infer<typeof fuelingIdParamSchema>;

export {
  createFuelingSchema,
  updateFuelingSchema,
  fuelingIdParamSchema,
  fuelingSchemaQuery,
};
