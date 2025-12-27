import { prisma } from "@/lib/prisma";
import { HelpdeskQuery } from "@pass/schemas/helpdeskSchema";

export const listHelpdeskService = async (query: HelpdeskQuery) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    priority,
    category,
    clientId,
    assignedUserId
  } = query;

  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;
  if (clientId) where.clientId = clientId;
  if (assignedUserId) where.assignedUserId = assignedUserId;

  const orderBy: any = { [sortBy]: sortOrder };

  const total = await prisma.hELPDESK.count({ where });

  const helpdesks = await prisma.hELPDESK.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: helpdesks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};