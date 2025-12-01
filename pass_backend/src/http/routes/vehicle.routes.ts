import { FastifyInstance } from "fastify";

import { VehicleController } from "@/http/controllers/vehicleController";
import { FuelingController } from "../controllers/fuelingController";

import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleIdParam,
} from "@pass/schemas/vehicleSchema";
import { CreateFuelingInput } from "@pass/schemas/fuelingSchema";
import { CreateIncidentInput } from "@pass/schemas/incidentSchema";
import { CreateVehicleDocumentInput } from "@pass/schemas/vehicleDocumentSchema";
import { IncidentController } from "../controllers/incidentController";
import { VehicleDocumentController } from "../controllers/vehicleDocumentController";
import { VehicleImageController } from "../controllers/vehicleImageController";
import { CreateVehicleImageInput } from "@pass/schemas/vehicleImageSchema";

export const vehicleRoutes = async (app: FastifyInstance) => {
  const controllerVehicle = new VehicleController();
  const controllerFueling = new FuelingController();
  const controllerIncident = new IncidentController();
  const controllerVehicleDocument = new VehicleDocumentController();
    const imageController = new VehicleImageController();

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

  // Vehicle Document routes related to vehicles
  app.get("/:id/documents", controllerVehicleDocument.listDocumentByVehicleId);

  app.post<{ Body: CreateVehicleDocumentInput; Params: VehicleIdParam }>(
    "/:id/documents",
    controllerVehicleDocument.createDocument
  );

    app.get<{ Params: VehicleIdParam }>("/:id/images", imageController.listImageByVehicleId.bind(imageController));
    app.post<{ Body: CreateVehicleImageInput; Params: VehicleIdParam }>("/:id/images", imageController.createImage.bind(imageController));

};
