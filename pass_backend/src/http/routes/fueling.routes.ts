import { FastifyInstance } from "fastify";
import { FuelingController } from "../controllers/fuelingController";
const controllerFueling = new FuelingController();

export const fuelingRoutes = async (app: FastifyInstance) => {
  app.get("/", controllerFueling.listFuelings);

  
  // create a fueling
  // app.post<{ Body: CreateFuelingInput; Params: VehicleIdParam }>(
  //   "/fuelings",
  //   controllerFueling.createFueling
  // );
};
