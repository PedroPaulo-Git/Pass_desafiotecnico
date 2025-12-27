import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, ensureBucketExists } from "@/lib/minio";
import { MessageBucket } from "@pass/schemas/messageBucketSchema";

export const listMessagesService = async (helpdeskId: string) => {
  // First, get bucketPath from DB
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const helpdesk = await prisma.hELPDESK.findUnique({
    where: { id: helpdeskId },
  });
  if (!helpdesk) {
    throw new Error("Helpdesk not found");
  }

  const bucket = process.env.MINIO_BUCKET_HELPDESK || "helpdesk";

  // Ensure bucket exists
  try {
    await ensureBucketExists(bucket);
  } catch (error) {
    throw new Error(`MinIO storage unavailable: ${(error as Error).message}`);
  }

  // Try different prefix formats for backward compatibility
  const prefixes = [
    `${helpdesk.bucketPath}/messages/`, // New format: helpdesk/client_.../messages/
    `${helpdesk.bucketPath.replace(/^\/+/, '')}/messages/`, // Old format without leading slash
  ];

  let response = null;

  for (const prefix of prefixes) {
    console.log(`🔍 Trying prefix: ${prefix}`);
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    try {
      response = await s3Client.send(command);
      if (response.Contents && response.Contents.length > 0) {
        console.log(`✅ Found ${response.Contents.length} objects with prefix: ${prefix}`);
        break;
      }
    } catch (error) {
      console.log(`❌ Error with prefix ${prefix}:`, error instanceof Error ? error.message : String(error));
    }
  }

  if (!response || !response.Contents) {
    console.log(`📋 No messages found for ticket ${helpdeskId}`);
    await prisma.$disconnect();
    return [];
  }
  const messages: MessageBucket[] = [];

  if (response.Contents) {
    for (const obj of response.Contents.sort((a, b) =>
      a.Key! > b.Key! ? 1 : -1
    )) {
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: obj.Key,
      });
      const objResponse = await s3Client.send(getCommand);
      const body = await objResponse.Body?.transformToString();
      if (body) {
        const message = JSON.parse(body);
        messages.push(message);
      }
    }
  }

  await prisma.$disconnect();
  return messages;
};
