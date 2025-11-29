import { FastifyInstance } from "fastify";

import { VehicleController } from "@/http/controllers/vehicleController";
import { FuelingController } from "../controllers/fuelingController";

import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleIdParam,
} from "@/schemas/vehicleSchema";
import { CreateFuelingInput } from "@/schemas/fuelingSchema";
import { CreateIncidentInput } from "@/schemas/incidentSchema";
import { IncidentController } from "../controllers/incidentController";

export const vehicleRoutes = async (app: FastifyInstance) => {
  const controllerVehicle = new VehicleController();
  const controllerFueling = new FuelingController();
  const controllerIncident = new IncidentController();

  // get all vehicles
  app.get("/", controllerVehicle.listVehicles);

  // get vehicle by id
  app.get("/:id", controllerVehicle.listVehicleById);

  //create vehicle
  app.post<{ Body: CreateVehicleInput }>("/", controllerVehicle.createVehicle);

  //update vehicle
  app.put<{ Body: UpdateVehicleInput; Params: VehicleIdParam }>(
    "/:id",
    controllerVehicle.updateVehicle
  );
  //delete vehicle
  app.delete<{ Params: VehicleIdParam }>("/:id", controllerVehicle.deleteVehicle);

  // Fueling routes related to vehicles


  // get a fueling for a vehicle
  app.get("/:id/fuelings", controllerFueling.listFuelingByVehicleId);

  // create a fueling for a vehicle
  app.post<{ Body: CreateFuelingInput; Params: VehicleIdParam }>(
    "/:id/fuelings",
    controllerFueling.createFueling
  );


  // Incident routes related to vehicles can be added here similarly

  app.get("/:id/incidents", controllerIncident.listIncidentByVehicleId);
  
  app.post<{ Body: CreateIncidentInput; Params: VehicleIdParam }>(
    "/:id/incidents",
    controllerIncident.createIncident
  );

};
