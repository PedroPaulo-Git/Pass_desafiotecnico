import { FastifyInstance } from "fastify";

import { VehicleController } from "@/http/controllers/vehicleController";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleIdParam,
} from "@/schemas/vehicleSchema";

export const vehicleRoutes = async (app: FastifyInstance) => {
  const controller = new VehicleController();
  // get all vehicles
  app.get("/", controller.listVehicles);

  // get vehicle by id
  app.get("/:id", controller.listVehicleById);

  //create vehicle
  app.post<{ Body: CreateVehicleInput }>("/", controller.createVehicle);

  //update vehicle
  app.put<{ Body: UpdateVehicleInput; Params: VehicleIdParam }>(
    "/:id",
    controller.updateVehicle
  );
  //delete vehicle
  app.delete<{ Params: VehicleIdParam }>("/:id", controller.deleteVehicle);
};
