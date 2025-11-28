import { prisma } from "@/lib/prisma";
import { CreateFuelingInput } from "@/schemas/fuelingSchema";
import { VehicleIdParam } from "@/schemas/vehicleSchema";
import { AppError } from "@/utils/AppError";

export const createFuelingService = async (
  vehicleId: VehicleIdParam,
  fuelingData: CreateFuelingInput
) => {
 
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId.id,
    },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND", {});
  }

  console.log("vehicle : ", vehicle);

  const result = await prisma.fueling.create({
    data: {
      ...fuelingData,
      vehicleId: vehicle.id,
    },
  });

  if (!result) {
    throw new AppError(
      "Failed to create fueling",
      500,
      "FUELING_CREATION_FAILED"
    );
  }
  return result;
};
