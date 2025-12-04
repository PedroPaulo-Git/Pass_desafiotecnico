import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "@/utils/AppError";

interface ListVehicleDocumentParams {
  page: number;
  limit: number;
  where: Prisma.VehicleDocumentWhereInput;
  orderBy?:
    | Prisma.VehicleDocumentOrderByWithRelationInput
    | Prisma.VehicleDocumentOrderByWithRelationInput[];
}

export const listVehicleDocumentService = async ({
  page,
  limit,
  where,
  orderBy,
}: ListVehicleDocumentParams) => {
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.vehicleDocument.count({ where }),
    prisma.vehicleDocument.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderBy ?? [{ expiryDate: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { items, page, limit, total, totalPages };
};

export const listVehicleDocumentById = async (documentId: string) => {
  const document = await prisma.vehicleDocument.findUnique({
    where: { id: documentId },
  });
  if (!document) {
    throw new AppError(
      "Vehicle document not found",
      404,
      "VEHICLE_DOCUMENT_NOT_FOUND",
      { documentId }
    );
  }
  return document;
};

export const listVehicleDocumentServiceByVehicleId = async (
  vehicleId: string
) => {
  const documents = await prisma.vehicleDocument.findMany({
    where: { vehicleId },
  });
  if (documents.length === 0) {
    throw new AppError(
      "Vehicle documents not found",
      404,
      "VEHICLE_DOCUMENTS_NOT_FOUND",
      { vehicleId }
    );
  }
  return documents;
};
