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

  if (incidentData.date > new Date()) {
    throw new AppError("Date cannot be in the future", 400, "INVALID_DATE", {
      date: incidentData.date,
    });
  }
  if (incidentData.date < new Date("1886-01-01")) {
    throw new AppError(
      "Date must be after January 1, 1886",
      400,
      "INVALID_DATE",
      { date: incidentData.date }
    );
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
