import { z } from "zod";

const createFuelingSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  date: z.coerce.date(),
  odometer: z.number().min(0, "Odometer must be non-negative"),
  fuelType: z.enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"]),
  liters: z.number().min(0, "Liters must be non-negative"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalValue: z.number().min(0, "Total must be non-negative").optional(),
  notes: z.string().optional(),
});

const fuelingSchemaQuery = z
  .object({
    page: z.coerce.number().int().positive().min(1).default(1),
    limit: z.coerce.number().int().positive().min(1).max(100).default(10),
    provider: z
      .string()
      .min(1, "Provider must be at least 1 character")
      .optional(),
    fuelType: z
      .enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"])
      .optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    minOdometer: z.coerce
      .number()
      .min(0, "Odometer must be non-negative")
      .optional(),
    maxOdometer: z.coerce
      .number()
      .min(0, "Odometer must be non-negative")
      .optional(),
    minLiters: z.coerce
      .number()
      .min(0, "Liters must be non-negative")
      .optional(),
    maxLiters: z.coerce
      .number()
      .max(1000000, "Liters must be less than or equal to 1000000")
      .optional(),
    minUnitPrice: z.coerce
      .number()
      .min(0, "Unit price must be non-negative")
      .optional(),
    maxUnitPrice: z.coerce
      .number()
      .min(0, "Unit price must be non-negative")
      .optional(),
    totalValue: z.coerce
      .number()
      .min(0, "Total must be non-negative")
      .optional(),
    sortBy: z
      .enum(["date", "odometer", "liters", "unitPrice", "totalValue"])
      .default("date")
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dateFrom must be before dateTo",
        path: ["dateFrom", "dateTo"],
      });
    }
    if (
      value.minOdometer !== undefined &&
      value.maxOdometer !== undefined &&
      value.minOdometer > value.maxOdometer
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minOdometer must be less than or equal to maxOdometer",
        path: ["minOdometer", "maxOdometer"],
      });
    }
    if (
      value.minLiters !== undefined &&
      value.maxLiters !== undefined &&
      value.minLiters > value.maxLiters
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minLiters must be less than or equal to maxLiters",
        path: ["minLiters", "maxLiters"],
      });
    }
    if (
      value.minUnitPrice !== undefined &&
      value.maxUnitPrice !== undefined &&
      value.minUnitPrice > value.maxUnitPrice
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minUnitPrice must be less than or equal to maxUnitPrice",
        path: ["minUnitPrice", "maxUnitPrice"],
      });
    }
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
