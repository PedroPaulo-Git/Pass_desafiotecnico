import { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";
import {
  createVehicleImageSchema,
  updateVehicleImageSchema,
  vehicleImageQuerySchema,
  vehicleImageIdParamSchema,
  CreateVehicleImageInput,
  UpdateVehicleImageInput,
  VehicleImageIdParam,
} from "@pass/schemas/vehicleImageSchema";
import { VehicleIdParam } from "@pass/schemas/vehicleSchema";
import {
  listVehicleImageService,
  listVehicleImageById,
  listVehicleImageServiceByVehicleId,
  createVehicleImageService,
  updateVehicleImageService,
  deleteVehicleImageService,
} from "@/services/vehicleImageServices";

export class VehicleImageController {
  async listImages(request: FastifyRequest, reply: FastifyReply) {
    const queryValidated = vehicleImageQuerySchema.parse(request.query);

    const page = queryValidated.page;
    const limit = queryValidated.limit;

    const where: Prisma.VehicleImageWhereInput = {};

    const sortField = queryValidated.sortBy ?? "id";
    const sortOrder = queryValidated.sortOrder ?? "desc";
    const orderBy: Prisma.VehicleImageOrderByWithRelationInput[] = [
      { [sortField]: sortOrder } as Prisma.VehicleImageOrderByWithRelationInput,
    ];

    if (queryValidated.vehicleId) where.vehicleId = queryValidated.vehicleId;
    if (queryValidated.url) where.url = queryValidated.url;

    const result = await listVehicleImageService({ page, limit, where, orderBy });
    return reply.status(200).send(result);
  }

  async listImageById(
    request: FastifyRequest<{ Params: VehicleImageIdParam }>,
    reply: FastifyReply
  ) {
    const imageId = request.params;
    const result = await listVehicleImageById(imageId.id);
    return reply.status(200).send(result);
  }

  async listImageByVehicleId(
    request: FastifyRequest<{ Params: VehicleIdParam }>,
    reply: FastifyReply
  ) {
    const result = await listVehicleImageServiceByVehicleId(request.params.id);
    return reply.status(200).send(result);
  }

  async createImage(
    request: FastifyRequest<{ Body: CreateVehicleImageInput; Params: VehicleIdParam }>,
    reply: FastifyReply
  ) {
    const vehicleId = request.params;
    const imageData = createVehicleImageSchema.parse(request.body);
    const result = await createVehicleImageService(vehicleId, imageData);
    return reply.status(201).send(result);
  }

  async updateImage(
    request: FastifyRequest<{ Body: UpdateVehicleImageInput; Params: VehicleImageIdParam }>,
    reply: FastifyReply
  ) {
    const imageId = vehicleImageIdParamSchema.parse(request.params);
    const imageData = updateVehicleImageSchema.parse(request.body);
    const result = await updateVehicleImageService(imageId, imageData);
    return reply.status(200).send(result);
  }

  async deleteImage(
    request: FastifyRequest<{ Params: VehicleImageIdParam }>,
    reply: FastifyReply
  ) {
    const imageId = request.params.id;
    const result = await deleteVehicleImageService(imageId);
    return reply.status(200).send(result);
  }
}
