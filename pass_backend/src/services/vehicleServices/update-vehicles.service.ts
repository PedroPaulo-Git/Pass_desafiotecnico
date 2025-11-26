import { prisma } from "../../lib/prisma";
import { VehicleType } from "@/type/vehicleType";

export const updateVehicleService = async (vehicleData: VehicleType, id: string) => {
  const updateVehicle = await prisma.vehicle.update({
    where: {
      id: id,
    },
    data: vehicleData,
  });
  return updateVehicle;
};
