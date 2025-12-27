import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";

export const getHelpdeskService = async (id: string) => {
  if (!id || id.trim() === "") {
    throw new AppError("Helpdesk ID is required", 400, "HELPDESK_ID_REQUIRED");
  }

  const helpdesk = await prisma.hELPDESK.findUnique({
    where: { id },
  });

  if (!helpdesk) {
    throw new AppError("Helpdesk not found", 404, "HELPDESK_NOT_FOUND", { id });
  }

  return helpdesk;
};