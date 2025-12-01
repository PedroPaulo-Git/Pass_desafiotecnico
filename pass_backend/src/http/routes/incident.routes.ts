import { FastifyInstance } from "fastify";
import { IncidentController } from "../controllers/incidentController";
import { IncidentIdParam, UpdateIncidentInput } from "@pass/schemas/incidentSchema";
const controllerIncident = new IncidentController();

export const incidentRoutes = async (app: FastifyInstance) => {
  app.get("/", controllerIncident.listIncidents);

  app.get("/:id", controllerIncident.listIncidentById);

  app.put<{ Body: UpdateIncidentInput; Params: IncidentIdParam }>(
    "/:id",
    controllerIncident.updateIncident
  );

  app.delete<{ Params: IncidentIdParam }>(
    "/:id",
    controllerIncident.deleteIncident
  );
};
