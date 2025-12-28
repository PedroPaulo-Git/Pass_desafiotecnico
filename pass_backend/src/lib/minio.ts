import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

const rawEndpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = process.env.MINIO_PORT || "9000";
const useSsl = String(process.env.MINIO_USE_SSL).toLowerCase() === "true";

function buildEndpoint(endpoint: string, port?: string, ssl = false) {
  let e = endpoint;
  if (!/^https?:\/\//i.test(e)) {
    e = `${ssl ? "https" : "http"}://${e}`;
  }
  // Only append port if it's not the default for the protocol
  if (port && !e.match(/:\d+$/)) {
    e = `${e}:${port}`;
  }
  return e;
}

const endpoint = buildEndpoint(rawEndpoint, port, useSsl);

const accessKey = process.env.MINIO_ROOT_USER || process.env.MINIO_ACCESS_KEY || "minioadmin";
const secretKey = process.env.MINIO_ROOT_PASSWORD || process.env.MINIO_SECRET_KEY || "minioadmin123";

const s3Client = new S3Client({
  endpoint,
  region: process.env.MINIO_REGION || "us-east-1",
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  forcePathStyle: true,
});
export const ensureBucketExists = async (bucketName: string) => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (error: any) {
    if (error.name === "NotFound") {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} created`);
    } else {
      throw error;
    }
  }
};

export { s3Client };
