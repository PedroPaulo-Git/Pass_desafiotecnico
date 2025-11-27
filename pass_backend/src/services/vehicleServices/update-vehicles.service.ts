import { prisma } from "../../lib/prisma";
import { UpdateVehicleInput } from "@/schemas/vehicleSchema";

export const updateVehicleService = async (vehicleData: UpdateVehicleInput, id: string) => {
  const updateVehicle = await prisma.vehicle.update({
    where: {
      id: id,
    },
    data: vehicleData,
  });
  return updateVehicle;
};
