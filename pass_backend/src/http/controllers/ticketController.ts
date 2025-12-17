import { FastifyReply, FastifyRequest } from "fastify";
import { createTicketService, listTicketsService, getTicketMessagesService, createMessageService } from "@/services/chatService";
import { createTicketSchema } from "@pass/schemas/ticketSchema";
import { createMessageSchema } from "@pass/schemas/messageSchema";

export class TicketController {
  async createTicket(request: FastifyRequest, reply: FastifyReply) {
    const body = createTicketSchema.parse(request.body);
    const ticket = await createTicketService(body.clientUuid, body.title);
    return reply.status(201).send(ticket);
  }

  async listTickets(_request: FastifyRequest, reply: FastifyReply) {
    const tickets = await listTicketsService();
    return reply.status(200).send(tickets);
  }

  async getMessages(request: FastifyRequest, reply: FastifyReply) {
    const ticketId = (request.params as any).id as string;
    const messages = await getTicketMessagesService(ticketId);
    return reply.status(200).send(messages);
  }

  async postMessage(request: FastifyRequest, reply: FastifyReply) {
    const body = createMessageSchema.parse(request.body);
    const msg = await createMessageService(body.ticketId, body.senderUuid, body.role, body.content);
    return reply.status(201).send(msg);
  }
}
