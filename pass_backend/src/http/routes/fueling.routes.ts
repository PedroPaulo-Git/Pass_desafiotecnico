import { FastifyInstance } from "fastify";
import { FuelingController } from "../controllers/fuelingController";
import { FuelingIdParam, UpdateFuelingInput } from "@pass/schemas/fuelingSchema";
const controllerFueling = new FuelingController();

export const fuelingRoutes = async (app: FastifyInstance) => {
  app.get("/", controllerFueling.listFuelings);

  app.get("/:id", controllerFueling.listFuelingById);

  app.put<{ Body: UpdateFuelingInput; Params: FuelingIdParam }>(
    "/:id",
    controllerFueling.updateFueling
  );

  app.delete<{ Params: FuelingIdParam }>("/:id", controllerFueling.deleteFueling);
};
