import {
  createVehicleService,
  listVehiclesService,
  listVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
} from "@/services/vehicleServices";
import { VehicleParams, VehicleType } from "@/type/vehicleType";
import { FastifyReply, FastifyRequest } from "fastify";

export class VehicleController {

//list all vehicles
  async listVehicles(_request: FastifyRequest, reply: FastifyReply) {
    const vehicles = await listVehiclesService();
    return reply.status(200).send(vehicles);
  }

//list vehicle by id
  async listVehicleById(
    request: FastifyRequest<{ Params: VehicleParams }>,
    reply: FastifyReply
  ) {
    const vehicleId = request?.params.id;
    const vehicle = await listVehicleByIdService(vehicleId);
    if (!vehicle) {
      return reply.status(404).send({ error: "Vehicle not found" });
    }
    return reply.status(200).send(vehicle);
  }
//create vehicle
  async createVehicle(
    request: FastifyRequest<{ Body: VehicleType }>,
    reply: FastifyReply
  ) {
    console.log("vehicleBody :", request.body);
    const vehicleBody = request.body;

    try {
      const vehicles = await createVehicleService(vehicleBody);
      reply.status(201).send(vehicles);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar veículo";
      reply.status(400).send({ error: message });
    }
  }
//update vehicle
  async updateVehicle(
    request: FastifyRequest<{ Body: VehicleType; Params: VehicleParams }>,
    reply: FastifyReply
  ) {
    if (!request.params?.id) {
      return reply.status(400).send({ error: "Vehicle ID is required" });
    }
    try {
      const vehicleId = request.params.id;
      const PreviousVehicleData = await listVehicleByIdService(vehicleId);
      console.log("Previous vehicle data:", PreviousVehicleData);

      if (!PreviousVehicleData) {
        return reply.status(404).send({ error: "Vehicle not found" });
      }
      const vehicleBody = request.body;

      console.log("vehicleBody :", vehicleBody);
      console.log("vehicleId :", vehicleId);

      if (PreviousVehicleData) {
        try {
          const data = await updateVehicleService(vehicleBody, vehicleId);
          console.log("Updated vehicle data:", data);
          reply.status(201).send(data);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Erro ao atualizar veículo";
          reply.status(400).send({ error: message });
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar veículo";
      reply.status(400).send({ error: message });
    }
  }

//delete vehicle
  async deleteVehicle(
    request: FastifyRequest<{ Params: VehicleParams }>,
    reply: FastifyReply
  ) {
    const vehicleId = request.params.id;
    await deleteVehicleService(vehicleId);
    return reply.status(204).send();
  }
}
