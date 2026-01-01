import { prisma } from "@/lib/prisma";

export const deleteUserService = async (id: string) => {
  await prisma.user.delete({
    where: { id },
  });

  return { message: "User deleted successfully" };
};