import { FastifyInstance } from "fastify";
import { VehicleType, VehicleParams } from "@/type/vehicleType";

import { VehicleController } from "@/http/controllers/vehicleController";
import { CreateVehicleInput,UpdateVehicleInput } from "@/schemas/vehicleSchema";

export const vehicleRoutes = async (app: FastifyInstance) => {
  const controller = new VehicleController();
  // get all vehicles
  app.get("/", controller.listVehicles);

  // get vehicle by id
  app.get("/:id", controller.listVehicleById);

  //create vehicle
  app.post<{ Body: CreateVehicleInput; Params: VehicleParams }>(
    "/",
    controller.createVehicle
  );

  //update vehicle
  app.put<{ Body: UpdateVehicleInput; Params: VehicleParams }>(
    "/:id",
    controller.updateVehicle
  );
  //delete vehicle
  app.delete("/:id", controller.deleteVehicle);
};
