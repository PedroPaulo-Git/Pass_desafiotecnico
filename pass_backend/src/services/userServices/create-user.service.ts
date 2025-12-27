import { prisma } from "@/lib/prisma";
import { CreateUserInput } from "@pass/schemas/userSchema";
import { AppError } from "@/utils/AppError";

export const createUserService = async (input: CreateUserInput) => {
  // Verificar se email já existe
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new AppError("Email already exists", 409, "EMAIL_ALREADY_EXISTS", {
      email: input.email,
    });
  }

  // Verificar se nome já existe
  const existingName = await prisma.user.findFirst({
    where: { name: input.name },
  });

  if (existingName) {
    throw new AppError("Name already exists", 409, "NAME_ALREADY_EXISTS", {
      name: input.name,
    });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
      },
    });

    return user;
  } catch (error) {
    // Capturar outros erros do Prisma (como constraint violations)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new AppError("Email already exists", 409, "EMAIL_ALREADY_EXISTS", {
        email: input.email,
      });
    }

    throw new AppError(
      "Failed to create user",
      500,
      "USER_CREATION_FAILED",
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
};