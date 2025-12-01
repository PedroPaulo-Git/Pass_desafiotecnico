import { prisma } from "@/lib/prisma";
import { VehicleImageIdParam, UpdateVehicleImageInput } from "@pass/schemas/vehicleImageSchema";
import { AppError } from "@/utils/AppError";

export const updateVehicleImageService = async (
  imageId: VehicleImageIdParam,
  imageData: UpdateVehicleImageInput
) => {
  const existing = await prisma.vehicleImage.findUnique({ where: { id: imageId.id } });
  if (!existing) {
    throw new AppError("Vehicle image not found", 404, "VEHICLE_IMAGE_NOT_FOUND", { imageId: imageId.id });
  }

  const updated = await prisma.vehicleImage.update({
    where: { id: imageId.id },
    data: { ...imageData },
  });
  return updated;
};
