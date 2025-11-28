import { AppError } from "@/utils/AppError";
import { prisma } from "../../lib/prisma";
import { CreateVehicleInput } from "@/schemas/vehicleSchema";

export const createVehicleService = async (vehicleData: CreateVehicleInput) => {
  const uniqueConstraints = [
    { plate: vehicleData.plate },
    { chassis: vehicleData.chassis }, // Assumindo que você tenha esse campo
    { renavam: vehicleData.renavam },
    { internalId: vehicleData.internalId }, // Assumindo que você tenha esse campo
  ];
  const conflitsValues = await prisma.vehicle.findFirst({
    where: {
      OR: uniqueConstraints.filter((c) => Object.values(c)[0] !== undefined),
    },
  });

  if (conflitsValues) {
    let conflictField = "";
    if (conflitsValues.plate === vehicleData.plate) conflictField = "plate";
    else if (conflitsValues.chassis === vehicleData.chassis)
      conflictField = "chassis";
    else if (conflitsValues.renavam === vehicleData.renavam)
      conflictField = "renavam";
    else if (conflitsValues.internalId === vehicleData.internalId)
      conflictField = "internalId";

    throw new AppError(
      `Vehicle with one of the unique fields already exists: ${conflictField}`,
      409,
      `VEHICLE_${conflictField.toUpperCase()}_CONFLICT`,
      {
        field: conflictField,
        value: vehicleData[conflictField as keyof CreateVehicleInput],
        conflictId: conflitsValues.id,
      }
    );
  }

  const newVehicle = await prisma.vehicle.create({
    data: vehicleData,
  });
  return newVehicle;
};
