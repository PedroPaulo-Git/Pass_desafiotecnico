import { prisma } from "@/lib/prisma";
import {
  VehicleDocumentIdParam,
  UpdateVehicleDocumentInput,
} from "@pass/schemas/vehicleDocumentSchema";
import { AppError } from "@/utils/AppError";

export const updateVehicleDocumentService = async (
  documentId: VehicleDocumentIdParam,
  documentData: UpdateVehicleDocumentInput
) => {
  const existing = await prisma.vehicleDocument.findUnique({
    where: { id: documentId.id },
  });
  if (!existing) {
    throw new AppError(
      "Vehicle document not found",
      404,
      "VEHICLE_DOCUMENT_NOT_FOUND",
      { documentId: documentId.id }
    );
  }
  if (documentData.expiryDate && documentData.expiryDate < new Date()) {
    throw new AppError(
      "Expiry date cannot be in the past",
      400,
      "INVALID_EXPIRY_DATE",
      { expiryDate: documentData.expiryDate }
    );
  }

  const updated = await prisma.vehicleDocument.update({
    where: { id: documentId.id },
    data: { ...documentData },
  });
  return updated;
};
