import { prisma } from "@/lib/prisma";
import { CreateVehicleImageInput } from "@pass/schemas/vehicleImageSchema";
import { VehicleIdParam } from "@pass/schemas/vehicleSchema";
import { AppError } from "@/utils/AppError";

export const createVehicleImageService = async (
  vehicleId: VehicleIdParam,
  imageData: CreateVehicleImageInput
) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId.id } });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND", { vehicleId: vehicleId.id });
  }

  const image = await prisma.vehicleImage.create({
    data: {
      ...imageData,
      vehicleId: vehicle.id,
    },
  });
  return image;
};
