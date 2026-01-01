import { FastifyInstance } from "fastify";
import { HelpdeskController } from "@/http/controllers/helpdeskController";

const helpdeskController = new HelpdeskController();

export async function helpdeskRoutes(app: FastifyInstance) {
  // CRUD Helpdesk
  app.post("/", helpdeskController.createHelpdesk.bind(helpdeskController));
  app.get("/", helpdeskController.listHelpdesks.bind(helpdeskController));
  app.get("/:id", helpdeskController.getHelpdesk.bind(helpdeskController));
  app.put("/:id", helpdeskController.updateHelpdesk.bind(helpdeskController));
  app.delete("/:id", helpdeskController.deleteHelpdesk.bind(helpdeskController));

  // Messages
  app.post("/:id/messages", helpdeskController.createMessage.bind(helpdeskController));
  app.get("/:id/messages", helpdeskController.listMessages.bind(helpdeskController));
}