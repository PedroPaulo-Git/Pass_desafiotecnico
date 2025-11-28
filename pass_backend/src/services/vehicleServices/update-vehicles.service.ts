import { AppError } from "@/utils/AppError";
import { prisma } from "../../lib/prisma";
import { UpdateVehicleInput } from "@/schemas/vehicleSchema";

export const updateVehicleService = async (
  vehicleData: UpdateVehicleInput,
  id: string
) => {
  const uniqueConstraints = [
    { plate: vehicleData.plate },
    { chassis: vehicleData.chassis },
    { renavam: vehicleData.renavam },
    { internalId: vehicleData.internalId },
  ];
  const conflictValues = await prisma.vehicle.findFirst({
    where: {
      OR: uniqueConstraints.filter((c) => Object.values(c)[0] !== undefined),
    },
  });
  let conflictField = "";

  if (conflictValues && conflictValues.id !== id) {
    if (conflictValues.plate === vehicleData.plate) conflictField = "plate";
    else if (conflictValues.chassis === vehicleData.chassis)
      conflictField = "chassis";
    else if (conflictValues.renavam === vehicleData.renavam)
      conflictField = "renavam";
    else if (conflictValues.internalId === vehicleData.internalId)
      conflictField = "internalId";

    throw new AppError(
      `Vehicle with one of the unique fields already exists: ${conflictField}`,
      409,
      `VEHICLE_${conflictField.toUpperCase()}_CONFLICT`,
      {
        field: conflictField,
        value: vehicleData[conflictField as keyof UpdateVehicleInput],
        conflictId: conflictValues.id,
      }
    );
  }

  const updateVehicle = await prisma.vehicle.update({
    where: {
      id: id,
    },
    data: vehicleData,
  });
  return updateVehicle;
};
