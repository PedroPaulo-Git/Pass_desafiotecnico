import { prisma } from "@/lib/prisma";
import { CreateVehicleDocumentInput } from "@/schemas/vehicleDocumentSchema";
import { VehicleIdParam } from "@/schemas/vehicleSchema";
import { AppError } from "@/utils/AppError";

export const createVehicleDocumentService = async (
  vehicleId: VehicleIdParam,
  documentData: CreateVehicleDocumentInput
) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId.id } });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND", { vehicleId: vehicleId.id });
  }

  // expiryDate must not be before today (basic domain rule)
  if (documentData.expiryDate < new Date()) {
    throw new AppError("Expiry date cannot be in the past", 400, "INVALID_EXPIRY_DATE", { expiryDate: documentData.expiryDate });
  }

  const newDocument = await prisma.vehicleDocument.create({
    data: {
      ...documentData,
      vehicleId: vehicle.id,
    },
  });

  return newDocument;
};
