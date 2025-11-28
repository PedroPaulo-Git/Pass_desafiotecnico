import { prisma } from "@/lib/prisma";
import { CreateFuelingInput } from "@/schemas/fuelingSchema";
import { VehicleIdParam } from "@/schemas/vehicleSchema";
import { AppError } from "@/utils/AppError";

export const createFuelingService = async (
  vehicleId: VehicleIdParam,
  fuelingData: CreateFuelingInput
) => {
  if (fuelingData.provider === null || fuelingData.provider === undefined) {
    throw new AppError(
      "Provider is required",
      400,
      "FUELING_PROVIDER_REQUIRED"
    );
  }
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId.id,
    },
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
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
