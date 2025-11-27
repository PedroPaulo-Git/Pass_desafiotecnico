import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

interface ListVehicleParams {
  page: number;
  limit: number;
  where: Prisma.VehicleWhereInput;
}

export const listVehicleService = async ({
  page,
  limit,
  where,
}: ListVehicleParams) => {
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    page,
    limit,
    total,
    totalPages,
  };
};

export const listVehicleByIdService = async (VehicleId: string) => {
  return await prisma.vehicle.findUnique({
    where: {
      id: VehicleId,
    },
  });
};
