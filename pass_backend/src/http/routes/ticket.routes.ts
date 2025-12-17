import { FastifyInstance } from "fastify";
import { TicketController } from "@/http/controllers/ticketController";

export const ticketRoutes = async (app: FastifyInstance) => {
  const controller = new TicketController();

  app.post("/", controller.createTicket);
  app.get("/", controller.listTickets);
  app.get("/:id/messages", controller.getMessages);
  app.post("/:id/messages", controller.postMessage);
};
