import { prisma } from "@/lib/prisma";
import { IncidentIdParam } from "@/schemas/incidentSchema";
import { AppError } from "@/utils/AppError";
import { UpdateIncidentInput } from "@/schemas/incidentSchema";

export const updateIncidentService = async (
  incidentId: IncidentIdParam,
  incidentData: UpdateIncidentInput
) => {
  const incident = await prisma.incident.findUnique({
    where: {
      id: incidentId.id,
    },
  });

  if (!incident) {
    throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND", {});
  }

  if (incidentData.date != undefined && incidentData.date > new Date()) {
    throw new AppError("Date cannot be in the future", 400, "INVALID_DATE", {
      date: incidentData.date,
    });
  }
  if (
    incidentData.date != undefined &&
    incidentData.date < new Date("1886-01-01")
  ) {
    throw new AppError(
      "Date must be after January 1, 1886",
      400,
      "INVALID_DATE",
      { date: incidentData.date }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedIncident = await tx.incident.update({
      where: { id: incidentId.id },
      data: { ...incidentData },
    });

    return updatedIncident;
  });
  return result;
};
