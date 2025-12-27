import { FastifyReply, FastifyRequest } from "fastify";
import { listUserService } from "@/services/userServices/list-user.service";
import { UserQuery } from "@pass/schemas/userSchema";

export const listUserController = async (
  request: FastifyRequest<{ Querystring: UserQuery }>,
  reply: FastifyReply
) => {
  try {
    const result = await listUserService(request.query);
    reply.send(result);
  } catch (error) {
    if (error instanceof Error) {
      reply.status(400).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal server error" });
    }
  }
};