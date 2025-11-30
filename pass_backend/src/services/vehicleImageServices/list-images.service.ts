import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "@/utils/AppError";

interface ListVehicleImageParams {
  page: number;
  limit: number;
  where: Prisma.VehicleImageWhereInput;
  orderBy?: Prisma.VehicleImageOrderByWithRelationInput | Prisma.VehicleImageOrderByWithRelationInput[];
}

export const listVehicleImageService = async ({
  page,
  limit,
  where,
  orderBy,
}: ListVehicleImageParams) => {
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.vehicleImage.count({ where }),
    prisma.vehicleImage.findMany({ where, skip, take: limit, orderBy }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, page, limit, total, totalPages };
};

export const listVehicleImageById = async (imageId: string) => {
  const image = await prisma.vehicleImage.findUnique({ where: { id: imageId } });
  if (!image) {
    throw new AppError("Vehicle image not found", 404, "VEHICLE_IMAGE_NOT_FOUND", { imageId });
  }
  return image;
};

export const listVehicleImageServiceByVehicleId = async (vehicleId: string) => {
  const images = await prisma.vehicleImage.findMany({ where: { vehicleId } });
  if (images.length === 0) {
    throw new AppError("Vehicle images not found", 404, "VEHICLE_IMAGES_NOT_FOUND", { vehicleId });
  }
  return images;
};
