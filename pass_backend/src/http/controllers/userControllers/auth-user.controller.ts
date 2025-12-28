import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { CreateUserInput } from "@pass/schemas/userSchema";

interface AuthRequest {
  email: string;
  name?: string;
  role?: "CLIENT" | "ADMIN" | "DEVELOPER";
}

export const authUserController = async (
  request: FastifyRequest<{ Body: AuthRequest }>,
  reply: FastifyReply
) => {
  try {
    const { email, name, role = "CLIENT" } = request.body;

    if (!email) {
      return reply.status(400).send({ error: "Email is required" });
    }

    // Tentar encontrar usuário existente
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Criar novo usuário se não existir
      const userData: CreateUserInput = {
        name: name || `User ${email.split('@')[0]}`,
        email,
        role,
      };

      user = await prisma.user.create({
        data: userData,
      });
    } else {
      // Atualizar role se fornecido e diferente
      if (role && role !== user.role) {
        user = await prisma.user.update({
          where: { email },
          data: { role },
        });
      }
    }

    reply.status(200).send(user);
  } catch (error) {
    console.error("Auth error:", error);
    if (error instanceof Error) {
      reply.status(400).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal server error" });
    }
  }
};