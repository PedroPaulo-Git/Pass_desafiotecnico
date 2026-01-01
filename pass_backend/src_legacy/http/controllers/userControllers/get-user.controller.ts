import { FastifyReply, FastifyRequest } from "fastify";
import { getUserService } from "@/services/userServices/get-user.service";

export const getUserController = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const user = await getUserService(request.params.id);
    reply.send(user);
  } catch (error) {
    if (error instanceof Error) {
      reply.status(404).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal server error" });
    }
  }
};