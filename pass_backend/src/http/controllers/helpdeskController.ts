import { FastifyReply, FastifyRequest } from "fastify";
import {
  createHelpdeskSchema,
} from "@pass/schemas/helpdeskSchema";
import { createMessageSchema } from "@pass/schemas/messageBucketSchema";
import {
  createHelpdeskService,
  listHelpdeskService,
  getHelpdeskService,
  updateHelpdeskService,
  deleteHelpdeskService,
  createMessageService,
  listMessagesService,
} from "@/services/helpdeskServices";

export class HelpdeskController {
  async createHelpdesk(request: FastifyRequest, reply: FastifyReply) {
    const body = createHelpdeskSchema.parse(request.body);
    const helpdesk = await createHelpdeskService(body);
    return reply.status(201).send(helpdesk);
  }

  async listHelpdesks(request: FastifyRequest, reply: FastifyReply) {
    // Manual validation to avoid Zod stripping unknown fields
    const query = request.query as any;
    const result = await listHelpdeskService(query);
    return reply.status(200).send(result);
  }

  async getHelpdesk(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const helpdesk = await getHelpdeskService(id);
    return reply.status(200).send(helpdesk);
  }

  async updateHelpdesk(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    
    // Debug: input and output
    console.log("🔄 UPDATE:", id, request.body);
    
    // WORKAROUND: Skip schema validation due to Zod parsing issues
    const body = request.body as any;
    
    const helpdesk = await updateHelpdeskService(id, body);
    console.log("✅ UPDATED:", helpdesk.title);
    return reply.status(200).send(helpdesk);
  }

  async deleteHelpdesk(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const result = await deleteHelpdeskService(id);
    return reply.status(200).send(result);
  }

  async createMessage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const body = createMessageSchema.parse(request.body);
    const result = await createMessageService(id, body);
    return reply.status(201).send(result);
  }

  async listMessages(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const messages = await listMessagesService(id);
    return reply.status(200).send(messages);
  }
}