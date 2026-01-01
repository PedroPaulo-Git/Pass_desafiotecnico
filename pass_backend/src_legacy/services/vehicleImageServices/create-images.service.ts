import { prisma } from "@/lib/prisma";
import { CreateVehicleImageInput } from "@pass/schemas/vehicleImageSchema";
import { AppError } from "@/utils/AppError";

export const createVehicleImageService = async (
  vehicleId: string,
  imageData: CreateVehicleImageInput
) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND", {
      vehicleId,
    });
  }

  const image = await prisma.vehicleImage.create({
    data: {
      ...imageData,
      vehicleId: vehicle.id,
    },
  });
  return image;
};
