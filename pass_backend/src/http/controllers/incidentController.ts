import { Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateIncidentInput, createIncidentSchema, IncidentIdParam } from "@/schemas/incidentSchema";
import {createIncidentService} from "@/services/incidentService";
import { VehicleIdParam } from "@/schemas/vehicleSchema";

export class IncidentController {
  async listIncidents(request: FastifyRequest, reply: FastifyReply) {
    // Implementation for listing incidents
  }
  async listIncidentById(
    request: FastifyRequest<{ Params: IncidentIdParam }>,
    reply: FastifyReply
  ) {
    // Implementation for listing an incident by ID
  }

  async createIncident(
    request: FastifyRequest<{
      Body: CreateIncidentInput;
      Params: VehicleIdParam;
    }>,
    reply: FastifyReply
  ) {
    const vehicleId = request.params;
    const validateIncident = createIncidentSchema.parse(request.body);

    const result = await createIncidentService(vehicleId, validateIncident);
    console.log(result)
    reply.status(201).send(result);
    // Implementation for creating an incident
  }
}
    