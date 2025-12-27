import { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserService } from "@/services/userServices/delete-user.service";

export const deleteUserController = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await deleteUserService(request.params.id);
    reply.send(result);
  } catch (error) {
    if (error instanceof Error) {
      reply.status(400).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal server error" });
    }
  }
};