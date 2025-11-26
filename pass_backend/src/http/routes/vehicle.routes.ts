import { FastifyInstance } from "fastify";
import {
  listVehicleByIdService,
  listVehiclesService,
} from "@/services/vehicleServices/list-vehicles.service";
import { createVehicleService } from "@/services/vehicleServices/create-vehicles.service";
import { VehicleType, VehicleParams } from "@/type/vehicleType";
import { updateVehicleService } from "@/services/vehicleServices/update-vehicles.service";
import { deleteVehicleService } from "@/services/vehicleServices/delete-vehicles.service";

export const vehicleRoutes = async (app: FastifyInstance) => {


  // get all vehicles
  app.get("/", async (_request, reply) => {
    const vehicles = await listVehiclesService();
    if (!vehicles) {
      return reply.status(404).send({ error: "Vehicle not found" });
    }
    return vehicles;
  });

  // get vehicle by id
  app.get<{ Params: VehicleParams }>("/:id", async (request, reply) => {
    const vehicleId = request.params.id;
    const vehicle = await listVehicleByIdService(vehicleId);
    if (!vehicle) {
      return reply.status(404).send({ error: "Vehicle not found" });
    }
    return vehicle;
  });

  //create vehicle
  app.post<{ Body: VehicleType; Params: VehicleParams }>(
    "/",
    async (request, reply) => {
      console.log("vehicleBody :", request.body);
      const vehicleBody = request.body;

      try {
        const vehicles = await createVehicleService(vehicleBody);
        reply.status(201).send(vehicles);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar veículo";
        reply.status(400).send({ error: message });
      }
    }
  );

  //update vehicle
  app.put<{ Body: VehicleType; Params: VehicleParams }>(
    "/:id",
    async (request, reply) => {
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
            const message = error instanceof Error ? error.message : "Erro ao atualizar veículo";
            reply.status(400).send({ error: message });
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar veículo";
        reply.status(400).send({ error: message });
      }
    }
  );
  //delete vehicle
  app.delete<{ Params: VehicleParams }>("/:id", async (request, reply) => {
    const vehicleId = request.params.id;
    await deleteVehicleService(vehicleId);
    return reply.status(204).send();
  });
};
