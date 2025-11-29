import { prisma } from "@/lib/prisma";
import { IncidentIdParam } from "@/schemas/incidentSchema";
import { AppError } from "@/utils/AppError";

export const deleteIncidentService = async (incidentId: IncidentIdParam) => {
  if (!incidentId || incidentId === undefined || incidentId === null) {
    throw new AppError("Incident ID is required", 400, "INCIDENT_ID_REQUIRED");
  }
  const incident = await prisma.incident.findUnique({
    where: {
      id: incidentId.id,
    },
  });
  if (!incident) {
    throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND");
  }
  const result = await prisma.incident.delete({
    where: {
      id: incidentId.id,
    },
  });
  return result;
};
