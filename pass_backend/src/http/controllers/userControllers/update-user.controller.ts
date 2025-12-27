import { FastifyReply, FastifyRequest } from "fastify";
import { updateUserService } from "@/services/userServices/update-user.service";
import { UpdateUserInput } from "@pass/schemas/userSchema";

export const updateUserController = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserInput }>,
  reply: FastifyReply
) => {
  try {
    const user = await updateUserService(request.params.id, request.body);
    reply.send(user);
  } catch (error) {
    if (error instanceof Error) {
      reply.status(400).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal server error" });
    }
  }
};