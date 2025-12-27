import { prisma } from "@/lib/prisma";
import { CreateHelpdeskInput } from "@pass/schemas/helpdeskSchema";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, ensureBucketExists } from "@/lib/minio";
import { AppError } from "@/utils/AppError";

export const createHelpdeskService = async (input: CreateHelpdeskInput) => {
  // Validate client exists and has CLIENT role
  const client = await prisma.user.findUnique({
    where: { id: input.clientId },
  });

  if (!client) {
    throw new AppError("Client not found", 404, "CLIENT_NOT_FOUND", { clientId: input.clientId });
  }

  if (client.role !== "CLIENT") {
    throw new AppError("User is not a client", 400, "INVALID_CLIENT_ROLE", {
      clientId: input.clientId,
      role: client.role
    });
  }

  // Validate userId if provided
  if (input.userId) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND", { userId: input.userId });
    }
  }

  // Enforce one open ticket per client
  const existing = await prisma.hELPDESK.findFirst({
    where: { clientId: input.clientId, status: { not: "ENCERRADO" } },
  });
  if (existing) {
    throw new AppError("Client already has an open ticket", 409, "TICKET_ALREADY_OPEN", {
      clientId: input.clientId,
      existingTicketId: existing.id,
      existingTicketNumber: existing.ticketNumber
    });
  }

  // Generate ticket number
  const currentYear = new Date().getFullYear();
  const lastTicket = await prisma.hELPDESK.findFirst({
    where: { ticketNumber: { startsWith: `TKT-${currentYear}-` } },
    orderBy: { ticketNumber: 'desc' },
  });

  let ticketSequence = 1;
  if (lastTicket?.ticketNumber) {
    const lastSequence = parseInt(lastTicket.ticketNumber.split('-')[2]);
    ticketSequence = lastSequence + 1;
  }

  const ticketNumber = `TKT-${currentYear}-${ticketSequence.toString().padStart(3, '0')}`;

  const ticketId = crypto.randomUUID();
  const bucketPath = `helpdesk/client_${input.clientId}/ticket_${ticketId}`;
  const bucketName = process.env.MINIO_BUCKET_HELPDESK || "helpdesk";

  // Validate attachments URLs if provided
  if (input.attachments && input.attachments.length > 0) {
    for (const attachment of input.attachments) {
      try {
        new URL(attachment);
      } catch {
        throw new AppError("Invalid attachment URL", 400, "INVALID_ATTACHMENT_URL", {
          invalidUrl: attachment
        });
      }
    }
  }

  // Ensure bucket exists
  try {
    await ensureBucketExists(bucketName);
  } catch (error) {
    throw new AppError("MinIO storage unavailable", 503, "STORAGE_UNAVAILABLE", {
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Create ticket.json in bucket
  const ticketJson = {
    id: ticketId,
    ticketNumber,
    clientId: input.clientId,
    userId: input.userId,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    module: input.module,
    environment: input.environment,
    attachments: input.attachments || [],
    createdAt: new Date().toISOString(),
  };

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: `${bucketPath}/ticket.json`,
      Body: JSON.stringify(ticketJson),
      ContentType: "application/json",
    }));
  } catch (error) {
    throw new AppError("Failed to create ticket in bucket", 500, "BUCKET_ERROR", { error });
  }

  try {
    const helpdesk = await prisma.hELPDESK.create({
      data: {
        ticketNumber,
        clientId: input.clientId,
        userId: input.userId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        module: input.module,
        environment: input.environment,
        bucketPath,
        lastMessageAt: new Date(),
      },
    });

    return helpdesk;
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new AppError("Ticket number already exists", 409, "TICKET_NUMBER_CONFLICT", {
        ticketNumber,
        error: error.message
      });
    }

    throw new AppError("Failed to create helpdesk ticket", 500, "HELPDESK_CREATION_FAILED", {
      error: error instanceof Error ? error.message : String(error)
    });
  }
};