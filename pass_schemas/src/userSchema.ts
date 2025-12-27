import { z } from "zod";

export const userRoleSchema = z.enum(["CLIENT", "ADMIN", "DEVELOPER"]);

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: userRoleSchema.default("CLIENT"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "email", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  role: userRoleSchema.optional(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  role: userRoleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
export type User = z.infer<typeof userSchema>;