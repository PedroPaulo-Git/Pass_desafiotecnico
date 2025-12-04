import { FastifyInstance } from "fastify";
import { VehicleDocumentController } from "../controllers/vehicleDocumentController";
import {
  VehicleDocumentIdParam,
  UpdateVehicleDocumentInput,
} from "@pass/schemas/vehicleDocumentSchema";

const controllerVehicleDocument = new VehicleDocumentController();

export const vehicleDocumentRoutes = async (app: FastifyInstance) => {
  app.get("/", controllerVehicleDocument.listDocuments);

  app.get("/:id", controllerVehicleDocument.listDocumentById);

  app.put<{ Body: UpdateVehicleDocumentInput; Params: VehicleDocumentIdParam }>(
    "/:id",
    controllerVehicleDocument.updateDocument
  );

  app.delete<{ Params: VehicleDocumentIdParam }>(
    "/:id",
    controllerVehicleDocument.deleteDocument
  );
};
