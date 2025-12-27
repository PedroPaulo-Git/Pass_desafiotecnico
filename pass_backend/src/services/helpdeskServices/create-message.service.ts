import { prisma } from "@/lib/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, ensureBucketExists } from "@/lib/minio";
import { AppError } from "@/utils/AppError";
import { MessageBucket, CreateMessageInput } from "@pass/schemas/messageBucketSchema";

export const createMessageService = async (helpdeskId: string, messageData: CreateMessageInput) => {
  const helpdesk = await prisma.hELPDESK.findUnique({ where: { id: helpdeskId } });
  if (!helpdesk) {
    throw new AppError("Helpdesk not found", 404, "HELPDESK_NOT_FOUND", { id: helpdeskId });
  }

  // Validate author exists
  const author = await prisma.user.findUnique({
    where: { id: messageData.authorId },
  });

  if (!author) {
    throw new AppError("Message author not found", 404, "AUTHOR_NOT_FOUND", {
      authorId: messageData.authorId,
      authorType: messageData.authorType
    });
  }

  // Validate author role matches authorType
  if (messageData.authorType === "user" && author.role !== "CLIENT") {
    throw new AppError("Author type mismatch: expected CLIENT role", 400, "AUTHOR_ROLE_MISMATCH", {
      authorId: messageData.authorId,
      expectedType: "user",
      actualRole: author.role
    });
  }

  if (messageData.authorType === "support" && author.role !== "DEVELOPER") {
    throw new AppError("Author type mismatch: expected DEVELOPER role", 400, "AUTHOR_ROLE_MISMATCH", {
      authorId: messageData.authorId,
      expectedType: "support",
      actualRole: author.role
    });
  }

  // Validate attachments URLs if provided
  if (messageData.attachments && messageData.attachments.length > 0) {
    for (const attachment of messageData.attachments) {
      try {
        new URL(attachment);
      } catch {
        throw new AppError("Invalid attachment URL", 400, "INVALID_ATTACHMENT_URL", {
          invalidUrl: attachment
        });
      }
    }
  }

  const bucketName = process.env.MINIO_BUCKET_HELPDESK || "helpdesk";

  // Ensure bucket exists
  try {
    await ensureBucketExists(bucketName);
  } catch (error) {
    throw new AppError("MinIO storage unavailable", 503, "STORAGE_UNAVAILABLE", { error: (error as Error).message });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${timestamp}_${messageData.authorType}_${messageData.authorId}.json`;

  // Create complete message object with generated createdAt
  const completeMessage: MessageBucket = {
    ...messageData,
    createdAt: new Date().toISOString(),
  };

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: `${helpdesk.bucketPath}/messages/${fileName}`,
      Body: JSON.stringify(completeMessage),
      ContentType: "application/json",
    }));
  } catch (error) {
    throw new AppError("Failed to save message in bucket", 500, "BUCKET_ERROR", { error });
  }

  // Update lastMessageAt
  try {
    await prisma.hELPDESK.update({
      where: { id: helpdeskId },
      data: { lastMessageAt: new Date() },
    });
  } catch (error) {
    throw new AppError("Failed to update ticket last message timestamp", 500, "UPDATE_TIMESTAMP_FAILED", {
      helpdeskId,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return { message: "Message sent successfully", fileName };
};