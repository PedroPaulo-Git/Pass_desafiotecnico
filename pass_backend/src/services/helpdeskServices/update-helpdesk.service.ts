import { prisma } from "@/lib/prisma";
import { UpdateHelpdeskInput } from "@pass/schemas/helpdeskSchema";
import { AppError } from "@/utils/AppError";

export const updateHelpdeskService = async (id: string, input: UpdateHelpdeskInput) => {
  const helpdesk = await prisma.hELPDESK.findUnique({ where: { id } });
  if (!helpdesk) {
    throw new AppError("Helpdesk not found", 404, "HELPDESK_NOT_FOUND", { id });
  }

  // Validate assignedUserId if provided
  if (input.assignedUserId) {
    const assignedUser = await prisma.user.findUnique({
      where: { id: input.assignedUserId },
    });

    if (!assignedUser) {
      throw new AppError("Assigned user not found", 404, "ASSIGNED_USER_NOT_FOUND", {
        assignedUserId: input.assignedUserId
      });
    }

    if (assignedUser.role !== "DEVELOPER") {
      throw new AppError("Assigned user must be a developer", 400, "INVALID_ASSIGNEE_ROLE", {
        assignedUserId: input.assignedUserId,
        role: assignedUser.role
      });
    }
  }

  const updateData: any = { ...input };
  if (input.status === "ENCERRADO") {
    updateData.closedAt = new Date();
  }

  try {
    const updated = await prisma.hELPDESK.update({
      where: { id },
      data: updateData,
    });

    return updated;
  } catch (error) {
    throw new AppError("Failed to update helpdesk ticket", 500, "HELPDESK_UPDATE_FAILED", {
      id,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};