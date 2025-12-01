import { Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateIncidentInput,
  createIncidentSchema,
  IncidentIdParam,
  incidentSchemaQuery,
  UpdateIncidentInput,
  updateIncidentSchema,
} from "@pass/schemas/incidentSchema";
import {
  listIncidentService,
  listIncidentServiceByVehicleId,
  listIncidentById,
  createIncidentService,
  updateIncidentService,
  deleteIncidentService,
} from "@/services/incidentService";
import { VehicleIdParam } from "@pass/schemas/vehicleSchema";

export class IncidentController {
  async listIncidents(request: FastifyRequest, reply: FastifyReply) {
    const queryValidated = incidentSchemaQuery.parse(request.query);

    const page = queryValidated.page;
    const limit = queryValidated.limit;
    const where: Prisma.IncidentWhereInput = {};

    const sortField = queryValidated.sortBy ?? "date";
    const sortOrder = queryValidated.sortOrder ?? "desc";
    let orderBy:
      | Prisma.IncidentOrderByWithRelationInput
      | Prisma.IncidentOrderByWithRelationInput[] = {
      [sortField]: sortOrder,
    };

    if (sortField === "date") {
      orderBy = [{ date: sortOrder }, { createdAt: "desc" }];
    } else {
      orderBy = [{ [sortField]: sortOrder }];
    }
    if (queryValidated.severity) where.severity = queryValidated.severity;
    const result = await listIncidentService({ page, limit, where, orderBy });
    reply.status(200).send(result);

    // Implementation for listing incidents
  }
  async listIncidentById(
    request: FastifyRequest<{ Params: IncidentIdParam }>,
    reply: FastifyReply
  ) {
    const incidentId = request.params.id;
    const result = await listIncidentById(incidentId);
    reply.status(200).send(result);

    // Implementation for listing incidents
  }

  async listIncidentByVehicleId(
    request: FastifyRequest<{ Params: VehicleIdParam }>,
    reply: FastifyReply
  ) {
    const result = await listIncidentServiceByVehicleId(request.params.id);
    reply.status(200).send(result);
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
    console.log(result);
    reply.status(201).send(result);
  }

  async updateIncident(
    request: FastifyRequest<{
      Body: UpdateIncidentInput;
      Params: IncidentIdParam;
    }>,
    reply: FastifyReply
  ) {
    const incidentId = request.params;
    const validateIncident = updateIncidentSchema.parse(request.body);
    const result = await updateIncidentService(incidentId, validateIncident);
    reply.status(200).send(result);
  }
  
  async deleteIncident(
    request: FastifyRequest<{ Params: IncidentIdParam }>,
    reply: FastifyReply
  ) {
    const incidentId = request.params;
    const result = await deleteIncidentService(incidentId);
    reply.status(204).send(result);
  }
}
