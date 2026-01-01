import { FastifyReply, FastifyRequest } from "fastify";
import { createUserService } from "@/services/userServices/create-user.service";
import { CreateUserInput } from "@pass/schemas/userSchema";

export const createUserController = async (
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) => {
  try {
    const user = await createUserService(request.body);
    reply.status(201).send(user);
  } catch (error) {
    if (error instanceof Error) {
      reply.status(400).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal server error" });
    }
  }
};