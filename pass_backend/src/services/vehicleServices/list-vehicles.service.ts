import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "@/utils/AppError";

interface ListVehicleParams {
  page: number;
  limit: number;
  where: Prisma.VehicleWhereInput;
  orderBy?: Prisma.VehicleOrderByWithRelationInput | Prisma.VehicleOrderByWithRelationInput[];
}

export const listVehicleService = async ({
  page,
  limit,
  where,
  orderBy,
}: ListVehicleParams) => {
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderBy ?? [{ createdAt: "desc" }],
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

export const listVehicleByIdService = async (vehicleId: string) => {
  if (!vehicleId || vehicleId === undefined || vehicleId === null) {
    throw new AppError("Vehicle ID is required", 400, "VEHICLE_ID_REQUIRED");
  }
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },
  });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND", {
      id: vehicleId,
    });
  }
  return vehicle;
};
