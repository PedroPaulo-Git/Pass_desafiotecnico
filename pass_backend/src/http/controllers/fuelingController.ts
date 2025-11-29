import {
  listFuelingById,
  listFuelingService,
  listFuelingServiceByVehicleId,
  createFuelingService,
  updateFuelingService,
  deleteFuelingService,
} from "@/services/fuelingServices";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateFuelingInput,
  UpdateFuelingInput,
  createFuelingSchema,
  FuelingIdParam,
  updateFuelingSchema,
  fuelingSchemaQuery,
} from "@/schemas/fuelingSchema";
import { VehicleIdParam } from "@/schemas/vehicleSchema";
import { Prisma } from "@prisma/client";
export class FuelingController {
  //list all fuelings
  async listFuelings(request: FastifyRequest, reply: FastifyReply) {
    const queryValidated = fuelingSchemaQuery.parse(request.query);

    const page = queryValidated.page;
    const limit = queryValidated.limit;
    const where: Prisma.FuelingWhereInput = {};

    const sortField = queryValidated.sortBy ?? "date";
    const sortOrder = queryValidated.sortOrder ?? "desc";
    let orderBy:
      | Prisma.FuelingOrderByWithRelationInput
      | Prisma.FuelingOrderByWithRelationInput[] = {
      [sortField]: sortOrder,
    };

    if (sortField === "date") {
      orderBy = [{ date: sortOrder }, { createdAt: "desc" }];
    } else {
      orderBy = [{ [sortField]: sortOrder }];
    }

    if (queryValidated.provider) where.provider = queryValidated.provider;
    if (queryValidated.fuelType) where.fuelType = queryValidated.fuelType;

    if (queryValidated.dateFrom || queryValidated.dateTo) {
      where.date = {
        ...(queryValidated.dateFrom && { gte: queryValidated.dateFrom }),
        ...(queryValidated.dateTo && { lte: queryValidated.dateTo }),
      };
    }
    if (queryValidated.minOdometer || queryValidated.maxOdometer) {
      where.odometer = {
        ...(queryValidated.minOdometer && { gte: queryValidated.minOdometer }),
        ...(queryValidated.maxOdometer && { lte: queryValidated.maxOdometer }),
      };
    }
    if (queryValidated.minLiters || queryValidated.maxLiters) {
      where.liters = {
        ...(queryValidated.minLiters && { gte: queryValidated.minLiters }),
        ...(queryValidated.maxLiters && { lte: queryValidated.maxLiters }),
      };
    }
    if (queryValidated.minUnitPrice || queryValidated.maxUnitPrice) {
      where.unitPrice = {
        ...(queryValidated.minUnitPrice && {
          gte: queryValidated.minUnitPrice,
        }),
        ...(queryValidated.maxUnitPrice && {
          lte: queryValidated.maxUnitPrice,
        }),
      };
    }
    if (queryValidated.totalValue) where.totalValue = queryValidated.totalValue;
    const result = await listFuelingService({ page, limit, where, orderBy });
    return reply.status(200).send(result);
  }

  //list fueling by id
  async listFuelingById(
    request: FastifyRequest<{ Params: FuelingIdParam }>,
    reply: FastifyReply
  ) {
    const fuelingId = request.params;

    const result = await listFuelingById(fuelingId.id);
    return reply.status(200).send(result);
  }

  //list fueling by vehicle id
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
    const vehicleId = request.params;
    const validateFueling = createFuelingSchema.parse(request.body);

    const result = await createFuelingService(vehicleId, validateFueling);
    return reply.status(201).send(result);
  }

  //update fueling
  async updateFueling(
    request: FastifyRequest<{
      Body: UpdateFuelingInput;
      Params: FuelingIdParam;
    }>,
    reply: FastifyReply
  ) {
    const fuelingId = request.params;
    const fuelingData = updateFuelingSchema.parse(request.body);

    const result = await updateFuelingService(fuelingId, fuelingData);
    return reply.status(200).send(result);
  }

  //delete fueling
  async deleteFueling(
    request: FastifyRequest<{ Params: FuelingIdParam }>,
    reply: FastifyReply
  ) {
    const fuelingId = request.params;

    const result = await deleteFuelingService(fuelingId.id);
    return reply.status(200).send(result);
  }
}
