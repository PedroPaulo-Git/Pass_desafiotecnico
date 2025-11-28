import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";

export const deleteFuelingService = async (fuelingId: string) => {
  if (!fuelingId || fuelingId === undefined || fuelingId === null) {
    throw new AppError("Fueling ID is required", 400, "FUELING_ID_REQUIRED");
  }
  const fueling = await prisma.fueling.findUnique({
    where: {
      id: fuelingId,
    },
  });
  if (!fueling) {
    throw new AppError("Fueling not found", 404, "FUELING_NOT_FOUND");
  }
  const result = await prisma.fueling.delete({
    where: {
      id: fuelingId,
    },
  });
  return result;
};
