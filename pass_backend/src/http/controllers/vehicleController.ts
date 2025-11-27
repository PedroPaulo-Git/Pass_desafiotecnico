import {
  createVehicleService,
  listVehicleService,
  listVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
} from "@/services/vehicleServices";
import { VehicleParams } from "@/type/vehicleType";
import { FastifyReply, FastifyRequest } from "fastify";

import {
  createVehicleSchema,
  updateVehicleSchema,
} from "@/schemas/vehicleSchema";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/schemas/vehicleSchema";

import { ZodError } from "zod";
import { vehicleSchemaQuery } from "@/schemas/vehicleListQuerySchema";

export class VehicleController {
  //list all vehicles
  async listVehicles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const queryValidated = vehicleSchemaQuery.parse(request.query);
      
      const page = queryValidated.page;
      const limit = queryValidated.limit;
      const where: any = {};
      if (queryValidated.status) where.status = queryValidated.status;
      if (queryValidated.category) where.category = queryValidated.category;
      if (queryValidated.classification) where.classification = queryValidated.classification;
      if (queryValidated.plate) where.plate = queryValidated.plate;
      if (queryValidated.brand) where.brand = queryValidated.brand;
      if (queryValidated.state) where.state = queryValidated.state;

      const result = await listVehicleService({ page, limit, where });
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.flatten().fieldErrors;
        return reply
          .status(400)
          .send({ error: "Validation error", details: formattedErrors });
      }
      const message = error instanceof Error ? error.message : "Erro ao listar veículos";
      return reply.status(500).send({ error: message });
    }
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
    request: FastifyRequest<{ Body: CreateVehicleInput }>,
    reply: FastifyReply
  ) {
    try {
      const validateVehicle = createVehicleSchema.parse(request.body);
      const vehicles = await createVehicleService(validateVehicle);
      reply.status(201).send(vehicles);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.flatten().fieldErrors;
        return reply
          .status(400)
          .send({ error: "Validation error", details: formattedErrors });
      }
      const message =
        error instanceof Error ? error.message : "Erro ao criar veículo";
      reply.status(400).send({ error: message });
    }
  }

  //update vehicle
  async updateVehicle(
    request: FastifyRequest<{
      Body: UpdateVehicleInput;
      Params: VehicleParams;
    }>,
    reply: FastifyReply
  ) {
    if (!request.params?.id) {
      return reply.status(400).send({ error: "Vehicle ID is required" });
    }
    try {
      const validateVehicle = updateVehicleSchema.parse(request.body);
      const vehicleId = request.params.id;
      const previousVehicleData = await listVehicleByIdService(vehicleId);

      if (!previousVehicleData) {
        return reply.status(404).send({ error: "Vehicle not found" });
      }
      const data = await updateVehicleService(validateVehicle, vehicleId);
      reply.status(200).send(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.flatten().fieldErrors;
        return reply
          .status(400)
          .send({ error: "Validation error", details: formattedErrors });
      }
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
