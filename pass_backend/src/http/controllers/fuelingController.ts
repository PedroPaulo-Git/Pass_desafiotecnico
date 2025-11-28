import {
  createFuelingService,
  listFuelingById,
  listFuelingService,
  listFuelingServiceByVehicleId,
} from "@/services/fuelingServices";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateFuelingInput, createFuelingSchema, FuelingIdParam } from "@/schemas/fuelingSchema";
import { VehicleIdParam } from "@/schemas/vehicleSchema";
export class FuelingController {
  async listFuelings(_request: FastifyRequest, reply: FastifyReply) {
    const result = await listFuelingService();
    return reply.status(200).send(result);
  }
  async listFuelingById(
    request: FastifyRequest<{ Params: FuelingIdParam }>,
    reply: FastifyReply
  ) {
    const fuelingId = request.params;
    const result = await listFuelingById(fuelingId.id);
    return reply.status(200).send(result);
  }
  async listFuelingByVehicleId(
    request: FastifyRequest<{ Params: VehicleIdParam }>,
    reply: FastifyReply
  ) {
    const result = await listFuelingServiceByVehicleId(request.params.id);
    return reply.status(200).send(result);
    // Logic to list fuelings by vehicle ID
  }
  //create fueling
  async createFueling(
    request: FastifyRequest<{
      Body: CreateFuelingInput;
      Params: VehicleIdParam;
    }>,
    reply: FastifyReply
  ) {
    // Logic to create a fueling
    const vehicleId = request.params;
    const fuelingData = request.body;

    const validateFueling = createFuelingSchema.parse(fuelingData);

    console.log("Creating fueling for vehicle ID:", vehicleId.id);
    console.log("Fueling data:", fuelingData);
    const result = await createFuelingService(vehicleId, validateFueling);
    console.log("Fueling created:", result);
    return reply.status(201).send(result);
  }
}
