import { prisma } from "@/lib/prisma";
import { AppError } from "@/utils/AppError";

export const deleteHelpdeskService = async (id: string) => {
  const helpdesk = await prisma.hELPDESK.findUnique({ where: { id } });
  if (!helpdesk) {
    throw new AppError("Helpdesk not found", 404, "HELPDESK_NOT_FOUND", { id });
  }

  // Only allow deletion of closed tickets
  if (helpdesk.status !== "ENCERRADO") {
    throw new AppError("Cannot delete open ticket", 400, "CANNOT_DELETE_OPEN_TICKET", {
      id,
      status: helpdesk.status,
      ticketNumber: helpdesk.ticketNumber
    });
  }

  try {
    await prisma.hELPDESK.delete({ where: { id } });

    // Optionally, delete from bucket, but for now, keep for audit

    return { message: "Helpdesk deleted successfully", ticketNumber: helpdesk.ticketNumber };
  } catch (error) {
    throw new AppError("Failed to delete helpdesk ticket", 500, "HELPDESK_DELETE_FAILED", {
      id,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};