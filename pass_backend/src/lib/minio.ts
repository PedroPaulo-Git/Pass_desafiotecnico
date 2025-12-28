import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

const rawEndpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = process.env.MINIO_PORT || "9000";
const useSsl = String(process.env.MINIO_USE_SSL).toLowerCase() === "true";

function buildEndpoint(endpoint: string, port?: string, ssl = false) {
  // Normalize and avoid appending a port when the provided endpoint already contains a scheme
  let e = endpoint.replace(/\/$/, "");
  const hadScheme = /^https?:\/\//i.test(e);
  if (!hadScheme) {
    e = `${ssl ? "https" : "http"}://${e}`;
    // Only append port when the original input did NOT include a scheme
    if (port && !e.match(/:\\d+$/)) {
      e = `${e}:${port}`;
    }
  }
  return e;
}

const endpoint = buildEndpoint(rawEndpoint, port, useSsl);

const accessKey = process.env.MINIO_ROOT_USER || "minioadmin";
const secretKey = process.env.MINIO_ROOT_PASSWORD || "minioadmin123";

const s3Client = new S3Client({
  endpoint,
  region: process.env.MINIO_REGION || "us-east-1",
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  forcePathStyle: true,
});
// Diagnostic info (avoid printing secrets)
console.log("[MINIO CLIENT] endpoint:", endpoint);
console.log("[MINIO CLIENT] region:", process.env.MINIO_REGION || "us-east-1");
console.log("[MINIO CLIENT] accessKey:", accessKey ? `${accessKey.slice(0, 3)}***` : "(none)");
export const ensureBucketExists = async (bucketName: string) => {
  try {
    console.log(`[MINIO] checking bucket exists: ${bucketName}`);
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`[MINIO] bucket exists: ${bucketName}`);
  } catch (error: any) {
    console.warn(`[MINIO] head bucket error for ${bucketName}:`, error?.name ?? error);
    if (error?.name === "NotFound" || error?.$metadata?.httpStatusCode === 404) {
      try {
        console.log(`[MINIO] creating bucket: ${bucketName}`);
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`[MINIO] Bucket ${bucketName} created`);
      } catch (createErr) {
        console.error(`[MINIO] create bucket failed for ${bucketName}:`, createErr);
        throw createErr;
      }
    } else {
      throw error;
    }
  }
};

export { s3Client };
