import { prisma } from "@/lib/prisma";
import { UpdateUserInput } from "@pass/schemas/userSchema";

export const updateUserService = async (id: string, input: UpdateUserInput) => {
  const user = await prisma.user.update({
    where: { id },
    data: input,
  });

  return user;
};