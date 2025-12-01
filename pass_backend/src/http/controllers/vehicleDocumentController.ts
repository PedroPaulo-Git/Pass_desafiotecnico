import { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";
import {
  createVehicleDocumentSchema,
  updateVehicleDocumentSchema,
  vehicleDocumentQuerySchema,
  vehicleDocumentIdParamSchema,
  CreateVehicleDocumentInput,
  UpdateVehicleDocumentInput,
  VehicleDocumentIdParam,
} from "@pass/schemas/vehicleDocumentSchema";
import { VehicleIdParam } from "@pass/schemas/vehicleSchema";
import {
  listVehicleDocumentService,
  listVehicleDocumentById,
  listVehicleDocumentServiceByVehicleId,
  createVehicleDocumentService,
  updateVehicleDocumentService,
  deleteVehicleDocumentService,
} from "@/services/vehicleDocumentServices";

export class VehicleDocumentController {
  async listDocuments(request: FastifyRequest, reply: FastifyReply) {
    const queryValidated = vehicleDocumentQuerySchema.parse(request.query);

    const page = queryValidated.page;
    const limit = queryValidated.limit;

    const where: Prisma.VehicleDocumentWhereInput = {};

    const sortField = queryValidated.sortBy ?? "expiryDate";
    const sortOrder = queryValidated.sortOrder ?? "desc";
    let orderBy:
      | Prisma.VehicleDocumentOrderByWithRelationInput
      | Prisma.VehicleDocumentOrderByWithRelationInput[] = {
      [sortField]: sortOrder,
    };

    if (sortField === "expiryDate") {
      orderBy = [{ expiryDate: sortOrder }, { createdAt: "desc" }];
    } else {
      orderBy = [{ [sortField]: sortOrder }];
    }

    if (queryValidated.name) where.name = queryValidated.name;
    if (queryValidated.vehicleId) where.vehicleId = queryValidated.vehicleId;
    if (queryValidated.activeAlert !== undefined)
      where.activeAlert = queryValidated.activeAlert;

    if (queryValidated.expiryDateFrom || queryValidated.expiryDateTo) {
      where.expiryDate = {
        ...(queryValidated.expiryDateFrom
          ? { gte: queryValidated.expiryDateFrom }
          : {}),
        ...(queryValidated.expiryDateTo
          ? { lte: queryValidated.expiryDateTo }
          : {}),
      };
    }

    if (queryValidated.expiringWithinDays) {
      const now = new Date();
      const limitDate = new Date(
        now.getTime() + queryValidated.expiringWithinDays * 24 * 60 * 60 * 1000
      );

      const expiry: Prisma.DateTimeFilter = {};
      // Se já havia um filtro objeto (DateTimeFilter), mescla manualmente
      if (
        where.expiryDate &&
        typeof where.expiryDate === "object" &&
        !("getTime" in (where.expiryDate as Prisma.DateTimeFilter))
      ) {
        Object.assign(expiry, where.expiryDate as Prisma.DateTimeFilter);
      }
      expiry.gte = now;
      expiry.lte = limitDate;

      where.expiryDate = expiry;
      where.activeAlert = true;
    }

    const result = await listVehicleDocumentService({
      page,
      limit,
      where,
      orderBy,
    });
    return reply.status(200).send(result);
  }

  async listDocumentById(
    request: FastifyRequest<{ Params: VehicleDocumentIdParam }>,
    reply: FastifyReply
  ) {
    const documentId = request.params;
    const result = await listVehicleDocumentById(documentId.id);
    return reply.status(200).send(result);
  }

  async listDocumentByVehicleId(
    request: FastifyRequest<{ Params: VehicleIdParam }>,
    reply: FastifyReply
  ) {
    const result = await listVehicleDocumentServiceByVehicleId(
      request.params.id
    );
    return reply.status(200).send(result);
  }

  async createDocument(
    request: FastifyRequest<{
      Body: CreateVehicleDocumentInput;
      Params: VehicleIdParam;
    }>,
    reply: FastifyReply
  ) {
    const vehicleId = request.params;
    const documentData = createVehicleDocumentSchema.parse(request.body);
    const result = await createVehicleDocumentService(vehicleId, documentData);
    return reply.status(201).send(result);
  }

  async updateDocument(
    request: FastifyRequest<{
      Body: UpdateVehicleDocumentInput;
      Params: VehicleDocumentIdParam;
    }>,
    reply: FastifyReply
  ) {
    const documentId = vehicleDocumentIdParamSchema.parse(request.params);
    const documentData = updateVehicleDocumentSchema.parse(request.body);
    const result = await updateVehicleDocumentService(documentId, documentData);
    return reply.status(200).send(result);
  }

  async deleteDocument(
    request: FastifyRequest<{ Params: VehicleDocumentIdParam }>,
    reply: FastifyReply
  ) {
    const documentId = request.params.id;
    const result = await deleteVehicleDocumentService(documentId);
    return reply.status(200).send(result);
  }
}
