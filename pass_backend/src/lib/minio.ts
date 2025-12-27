import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

// const endpoint = process.env.MINIO_ENDPOINT || "http://localhost";
const port = process.env.MINIO_PORT || "9000";
// const fullEndpoint = port && port !== "80" && port !== "443" ? `${endpoint}:${port}` : endpoint;
//`` ${process.env.MINIO_ENDPOINT}:${port}
const s3Client = new S3Client({
  //   endpoint: fullEndpoint,
  endpoint:`http://minio:${port}` || "http://minio:9000" ,
  region: "us-east-1", // MinIO default
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
  },
  forcePathStyle: true, // Required for MinIO
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
