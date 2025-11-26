import { FastifyInstance } from "fastify";
import { listVehiclesService } from "@/services/vehicleServices/list-vehicles.service";
import { create } from "domain";
import { createVehicleService } from "@/services/vehicleServices/create-vehicle.service";
import { VehicleType } from "@/type/vehicleType";
// import { PrismaClient } from '@prisma/client';

export const vehicleRoutes = async (app: FastifyInstance) => {
  app.get("/", async (request, reply) => {
    const vehicles = await listVehiclesService();
    return [vehicles];
  });

  app.post("/", async (request, reply) => {
    console.log("body :", request.body);
    const body: VehicleType | unknown = request.body;

    try {
      const vehicles = await createVehicleService(body as VehicleType);
      reply.status(201).send(vehicles);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      reply.status(500).send({ error: "Failed to create vehicle" });
    }
  });
};
