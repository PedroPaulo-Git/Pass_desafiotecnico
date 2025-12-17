import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socket";

export async function createTicketService(clientUuid: string, title?: string) {
  // enforce one open ticket per client
  const existing = await prisma.ticket.findFirst({
    where: { clientUuid, status: "OPEN" },
  });
  if (existing) return existing;

  const ticket = await prisma.ticket.create({
    data: { clientUuid, title },
  });

  // notify agents
  try {
    const io = getIO();
    io.to("agents").emit("ticket:created", ticket);
  } catch (e) {
    // socket may not be initialized in tests/dev
  }

  return ticket;
}

export async function listTicketsService() {
  return prisma.ticket.findMany({ include: { messages: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } });
}

export async function getTicketMessagesService(ticketId: string) {
  return prisma.message.findMany({ where: { ticketId }, orderBy: { createdAt: "asc" } });
}

export async function createMessageService(ticketId: string, senderUuid: string, role: string, content: string) {
  const msg = await prisma.message.create({ data: { ticketId, sender: senderUuid, role, content } });

  try {
    const io = getIO();
    io.to(`ticket:${ticketId}`).emit("message:receive", msg);
  } catch (e) {
    // ignore
  }

  return msg;
}
