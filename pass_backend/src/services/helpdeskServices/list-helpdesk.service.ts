import { prisma } from "@/lib/prisma";

export const listHelpdeskService = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    priority,
    category,
    clientId,
    assignedUserId,
    module,
    search
  } = query;

  // Ensure page and limit are numbers
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;

  // Build WHERE conditions dynamically
  const conditions: string[] = [];
  const params: any[] = [];

  if (status) {
    conditions.push(`"status" = $${conditions.length + 1}`);
    params.push(status);
  }
  if (priority) {
    conditions.push(`"priority" = $${conditions.length + 1}`);
    params.push(priority);
  }
  if (category) {
    conditions.push(`"category" = $${conditions.length + 1}`);
    params.push(category);
  }
  if (clientId) {
    conditions.push(`"clientId" = $${conditions.length + 1}`);
    params.push(clientId);
  }
  if (assignedUserId) {
    conditions.push(`"assignedUserId" = $${conditions.length + 1}`);
    params.push(assignedUserId);
  }
  if (module) {
    conditions.push(`"module" = $${conditions.length + 1}`);
    params.push(module);
  }
  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push(`(
      "title" ILIKE $${conditions.length + 1} OR
      "description" ILIKE $${conditions.length + 2} OR
      "ticketNumber" ILIKE $${conditions.length + 3} OR
      "id" ILIKE $${conditions.length + 4}
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Separate queries for data and count to avoid BigInt serialization issues
  const dataSql = `
    SELECT * FROM "helpdesk"
    ${whereClause}
    ORDER BY "${sortBy}" ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const countSql = `
    SELECT COUNT(*) as count FROM "helpdesk"
    ${whereClause}
  `;

  const dataParams = [...params, limitNum, (pageNum - 1) * limitNum];

  const [helpdesks, countResult] = await Promise.all([
    prisma.$queryRawUnsafe(dataSql, ...dataParams),
    prisma.$queryRawUnsafe(countSql, ...params)
  ]);

  const total = Number((countResult as any)[0].count);

  return {
    data: helpdesks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};