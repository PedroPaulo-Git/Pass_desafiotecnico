import { FastifyInstance } from "fastify";
import { createUserController } from "@/http/controllers/userControllers/create-user.controller";
import { listUserController } from "@/http/controllers/userControllers/list-user.controller";
import { getUserController } from "@/http/controllers/userControllers/get-user.controller";
import { updateUserController } from "@/http/controllers/userControllers/update-user.controller";
import { deleteUserController } from "@/http/controllers/userControllers/delete-user.controller";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", createUserController);
  app.get("/", listUserController);
  app.get("/:id", getUserController);
  app.put("/:id", updateUserController);
  app.delete("/:id", deleteUserController);
}