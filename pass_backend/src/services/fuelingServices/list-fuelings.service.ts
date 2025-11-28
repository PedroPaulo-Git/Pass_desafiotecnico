import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";

export const listFuelingService = async () => {
  const result = await prisma.fueling.findMany();
  return result;
};

export const listFuelingById = async (fuelingId: string) => {
  const fueling = await prisma.fueling.findUnique({
    where: {
      id: fuelingId,
    },
  });
  if (!fueling) {
    throw new AppError("Fueling not found", 404, "FUELING_NOT_FOUND", {
      fuelingId,
    });
  }
  return fueling;
};

export const listFuelingServiceByVehicleId = async (vehicleId: string) => {
  const result = await prisma.fueling.findMany({
    where: {
      vehicleId,
    },
  });
  console.log("Fuelings for vehicle ID", vehicleId, ":", result);

  if (result.length === 0) {
    throw new AppError("Fuelings not found", 404, "FUELINGS_NOT_FOUND", {
      vehicleId,
    });
  }
  return result;
};
