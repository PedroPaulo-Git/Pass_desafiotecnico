import { Prisma } from ".prisma/client/default";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";

interface ListIncidentParams {
  page: number;
  limit: number;
  where: Prisma.IncidentWhereInput;
  orderBy?:
    | Prisma.IncidentOrderByWithRelationInput
    | Prisma.IncidentOrderByWithRelationInput[];
}

export const listIncidentService = async ({
  page,
  limit,
  where,
  orderBy,
}: ListIncidentParams) => {
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.incident.count({ where }),
    prisma.incident.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderBy ?? [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const result = {
    items,
    page,
    limit,
    total,
    totalPages,
  };
  return result;
};

export const listIncidentById = async (incidentId: string) => {
  const incident = await prisma.incident.findUnique({
    where: {
      id: incidentId,
    },
  });
  if (!incident) {
    throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND", {
      incidentId,
    });
  }
  return incident;
};

export const listIncidentServiceByVehicleId = async (vehicleId: string) => {
  const result = await prisma.incident.findMany({
    where: {
      vehicleId,
    },
  });

  if (result.length === 0) {
    throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND", {
      vehicleId,
    });
  }
  return result;
};
