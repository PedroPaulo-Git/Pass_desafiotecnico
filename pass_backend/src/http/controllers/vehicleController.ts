import {
  createVehicleService,
  listVehicleService,
  listVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
} from "@/services/vehicleServices";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "@/schemas/vehicleSchema";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleIdParam,
} from "@/schemas/vehicleSchema";

import { vehicleSchemaQuery } from "@/schemas/vehicleListQuerySchema";

export class VehicleController {
  //list all vehicles
  async listVehicles(request: FastifyRequest, reply: FastifyReply) {
    const queryValidated = vehicleSchemaQuery.parse(request.query);

    const page = queryValidated.page;
    const limit = queryValidated.limit;
    const where: any = {};
    if (queryValidated.status) where.status = queryValidated.status;
    if (queryValidated.category) where.category = queryValidated.category;
    if (queryValidated.classification)
      where.classification = queryValidated.classification;
    if (queryValidated.plate) where.plate = queryValidated.plate;
    if (queryValidated.brand) where.brand = queryValidated.brand;
    if (queryValidated.state) where.state = queryValidated.state;

    const result = await listVehicleService({ page, limit, where });

    return reply.status(200).send(result);
  }

  //list vehicle by id
  async listVehicleById(
    request: FastifyRequest<{ Params: VehicleIdParam }>,
    reply: FastifyReply
  ) {
    const vehicleId = request?.params.id;
    const vehicle = await listVehicleByIdService(vehicleId);

    return reply.status(200).send(vehicle);
  }

  //create vehicle
  async createVehicle(
    request: FastifyRequest<{ Body: CreateVehicleInput }>,
    reply: FastifyReply
  ) {
    const validateVehicle = createVehicleSchema.parse(request.body);
    const vehicles = await createVehicleService(validateVehicle);
    reply.status(201).send(vehicles);
  }

  //update vehicle
  async updateVehicle(
    request: FastifyRequest<{
      Body: UpdateVehicleInput;
      Params: VehicleIdParam;
    }>,
    reply: FastifyReply
  ) {
    if (!request.params?.id) {
      return reply.status(400).send({ error: "Vehicle ID is required" });
    }

    const validateVehicle = updateVehicleSchema.parse(request.body);
    const vehicleId = request.params.id;
    const data = await updateVehicleService(validateVehicle, vehicleId);
    reply.status(200).send(data);
  }

  //delete vehicle
  async deleteVehicle(
    request: FastifyRequest<{ Params: VehicleIdParam }>,
    reply: FastifyReply
  ) {
    const vehicleId = request.params.id;
    await deleteVehicleService(vehicleId);
    return reply.status(204).send();
  }
}
