import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";

export const deleteVehicleImageService = async (imageId: string) => {
  const existing = await prisma.vehicleImage.findUnique({ where: { id: imageId } });
  if (!existing) {
    throw new AppError("Vehicle image not found", 404, "VEHICLE_IMAGE_NOT_FOUND", { imageId });
  }
  await prisma.vehicleImage.delete({ where: { id: imageId } });
  return { message: "Vehicle image deleted successfully" };
};
