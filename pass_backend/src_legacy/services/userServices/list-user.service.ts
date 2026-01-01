import { prisma } from "@/lib/prisma";
import { UserQuery } from "@pass/schemas/userSchema";

export const listUserService = async (query: UserQuery) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', role } = query;

  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};