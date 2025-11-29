import { prisma } from "@/lib/prisma";
import { CreateIncidentInput, IncidentIdParam } from "@/schemas/incidentSchema";
import { VehicleIdParam } from "@/schemas/vehicleSchema";
import { AppError } from "@/utils/AppError";

export const createIncidentService = async (
  vehicleId: VehicleIdParam,
  incidentData: CreateIncidentInput
) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId.id,
    },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND", {});
  }

  const result = await prisma.$transaction(async (tx) => {
    const newIncident = await tx.incident.create({
      data: {
        ...incidentData,
        vehicleId: vehicle.id,
      },
    });

    return newIncident;
  });
  return result;
};
