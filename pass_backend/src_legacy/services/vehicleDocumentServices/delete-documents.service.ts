import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";

export const deleteVehicleDocumentService = async (documentId: string) => {
  const existing = await prisma.vehicleDocument.findUnique({
    where: { id: documentId },
  });
  if (!existing) {
    throw new AppError(
      "Vehicle document not found",
      404,
      "VEHICLE_DOCUMENT_NOT_FOUND",
      { documentId }
    );
  }
  await prisma.vehicleDocument.delete({ where: { id: documentId } });
  return { message: "Vehicle document deleted successfully" };
};
