import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";
import { FuelingIdParam } from "@pass/schemas/fuelingSchema";

export const deleteFuelingService = async (fuelingId: FuelingIdParam) => {
  if (!fuelingId || fuelingId === undefined || fuelingId === null) {
    throw new AppError("Fueling ID is required", 400, "FUELING_ID_REQUIRED");
  }
  const fueling = await prisma.fueling.findUnique({
    where: {
      id: fuelingId.id,
    },
  });
  if (!fueling) {
    throw new AppError("Fueling not found", 404, "FUELING_NOT_FOUND");
  }
  const result = await prisma.fueling.delete({
    where: {
      id: fuelingId.id,
    },
  });
  return result;
};
