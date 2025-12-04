import { FastifyInstance } from "fastify";
import { VehicleImageController } from "@/http/controllers/vehicleImageController";
import {
  VehicleImageIdParam,
  UpdateVehicleImageInput,
} from "@pass/schemas/vehicleImageSchema";

export async function vehicleImageRoutes(app: FastifyInstance) {
  const controller = new VehicleImageController();

  app.get("/", controller.listImages.bind(controller));
  app.get<{ Params: VehicleImageIdParam }>(
    "/:id",
    controller.listImageById.bind(controller)
  );
  app.put<{ Body: UpdateVehicleImageInput; Params: VehicleImageIdParam }>(
    "/:id",
    controller.updateImage.bind(controller)
  );
  app.delete<{ Params: VehicleImageIdParam }>(
    "/:id",
    controller.deleteImage.bind(controller)
  );
}
