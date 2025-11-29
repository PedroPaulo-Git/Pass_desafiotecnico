import { Prisma } from ".prisma/client/default";
import { prisma } from "@/lib/prisma";
import { FuelingIdParam } from "@/schemas/fuelingSchema";
import { VehicleIdParam } from "@/schemas/vehicleSchema";
import { AppError } from "@/utils/AppError";

interface ListFuelingParams {
  page: number;
  limit: number;
  where: Prisma.FuelingWhereInput;
  orderBy?: Prisma.FuelingOrderByWithRelationInput | Prisma.FuelingOrderByWithRelationInput[];
}

export const listFuelingService = async ({
  page,
  limit,
  where,
  orderBy,
}: ListFuelingParams) => {
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.fueling.count({ where }),
    prisma.fueling.findMany({
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

export const listFuelingById = async (fuelingId: FuelingIdParam) => {
  const fueling = await prisma.fueling.findUnique({
    where: {
      id: fuelingId.id,
    },
  });
  if (!fueling) {
    throw new AppError("Fueling not found", 404, "FUELING_NOT_FOUND", {
      fuelingId,
    });
  }
  return fueling;
};

export const listFuelingServiceByVehicleId = async (vehicleId: VehicleIdParam) => {
  const result = await prisma.fueling.findMany({
    where: {
      vehicleId: vehicleId.id,
    },
  });

  if (result.length === 0) {
    throw new AppError("Fuelings not found", 404, "FUELINGS_NOT_FOUND", {
      vehicleId,
    });
  }
  return result;
};
