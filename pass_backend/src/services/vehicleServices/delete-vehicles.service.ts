import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";

export const deleteVehicleService = async (VehicleId: string) => {
  if (!VehicleId || VehicleId === undefined || VehicleId === null) {
    throw new AppError("Vehicle ID is required", 400, "VEHICLE_ID_REQUIRED");
  }
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: VehicleId,
    },
  });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND");
  }
  const result = await prisma.vehicle.delete({
    where: {
      id: VehicleId,
    },
  });
  return result;
};
