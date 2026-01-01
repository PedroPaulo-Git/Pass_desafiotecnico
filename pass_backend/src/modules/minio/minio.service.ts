import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { S3Client, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    const endpointEnv = this.configService.get<string>('MINIO_ENDPOINT');
    const portEnv = this.configService.get<string>('MINIO_PORT');
    const sslEnv = this.configService.get<string>('MINIO_USE_SSL');
    const rootUserEnv = this.configService.get<string>('MINIO_ROOT_USER');
    const rootPassEnv = this.configService.get<string>('MINIO_ROOT_PASSWORD');
    const accessKeyEnv = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKeyEnv = this.configService.get<string>('MINIO_SECRET_KEY');

    this.logger.log('--- MINIO CONFIG DEBUG ---');
    this.logger.log(`MINIO_ENDPOINT: ${endpointEnv}`);
    this.logger.log(`MINIO_PORT: ${portEnv}`);
    this.logger.log(`MINIO_USE_SSL: ${sslEnv}`);
    this.logger.log(`MINIO_ROOT_USER: ${rootUserEnv ? 'PRESENT' : 'MISSING'}`);
    this.logger.log(`MINIO_ACCESS_KEY: ${accessKeyEnv ? 'PRESENT' : 'MISSING'}`);
    this.logger.log('--------------------------');

    const rawEndpoint = endpointEnv || 'localhost';
    const port = portEnv || '9000';
    
    // Auto-detect SSL based on endpoint or explicit variable
    const isPublicRender = rawEndpoint.includes('.onrender.com');
    const isLocal = rawEndpoint === 'localhost' || rawEndpoint === '127.0.0.1' || rawEndpoint === 'minio';
    
    // If it's a public Render URL, we MUST use SSL (true)
    // If it's internal/local, we usually use SSL (false)
    let useSsl = sslEnv === 'true';
    if (isPublicRender && sslEnv !== 'false') useSsl = true;
    if (isLocal) useSsl = false;

    const accessKey = accessKeyEnv || rootUserEnv || 'minioadmin';
    const secretKey = secretKeyEnv || rootPassEnv || 'minioadmin123';

    // Build endpoint URL
    let endpoint = rawEndpoint.trim().replace(/\/$/, "");
    
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      const protocol = useSsl ? 'https' : 'http';
      endpoint = `${protocol}://${endpoint}`;

      // Logic for Ports:
      // 1. If public Render (.onrender.com), do NOT use port 9000. Use 443 (default for https).
      // 2. If Internal (no dot) or Localhost, use the provided port (9000).
      const isInternal = !rawEndpoint.includes('.');
      
      if (isInternal || isLocal) {
        endpoint = `${endpoint}:${port}`;
        this.logger.log(`Using INTERNAL/Local connection strategy for MinIO: ${endpoint}`);
      } else {
        this.logger.log(`Using EXTERNAL connection strategy for MinIO: ${endpoint}`);
      }
    }

    this.logger.log(`Final MinIO Client Endpoint: ${endpoint}`);
    this.logger.log(`MinIO AccessKey starts with: ${accessKey?.substring(0, 3)}...`);
    this.logger.log(`MinIO Use SSL: ${useSsl}`);

    this.s3Client = new S3Client({
      endpoint,
      region: this.configService.get<string>('MINIO_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    const vehiclesBucket = this.configService.get<string>('MINIO_BUCKET') || 'pass-vehicles';
    const helpdeskBucket = this.configService.get<string>('MINIO_BUCKET_HELPDESK') || 'helpdesk';

    this.logger.log('--- MINIO BUCKET INITIALIZATION ---');
    await this.ensureBucketExists(vehiclesBucket);
    await this.ensureBucketExists(helpdeskBucket);
    this.logger.log('-----------------------------------');
  }

  async ensureBucketExists(bucketName: string) {
    try {
      this.logger.debug(`[MINIO DEBUG] Sending HeadBucketCommand for: ${bucketName}`);
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      this.logger.log(`[MINIO SUCCESS] Bucket exists: ${bucketName}`);
    } catch (error: any) {
      this.logger.error(`[MINIO ERROR] Failed checking bucket "${bucketName}"`);
      this.logger.error(`[MINIO ERROR] Name: ${error?.name}`);
      this.logger.error(`[MINIO ERROR] Message: ${error?.message}`);
      this.logger.error(`[MINIO ERROR] HTTP Status: ${error?.$metadata?.httpStatusCode}`);
      
      if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
        try {
          this.logger.log(`[MINIO] Bucket not found. Creating bucket: ${bucketName}`);
          await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
          this.logger.log(`[MINIO] Bucket created successfully: ${bucketName}`);
        } catch (createError: any) {
          this.logger.error(`[MINIO FATAL] Failed to create bucket ${bucketName}`);
          this.logger.error(`[MINIO FATAL] Create Error: ${createError?.message}`);
        }
      } else {
        if (error?.$metadata?.httpStatusCode === 502) {
          this.logger.error(`[MINIO ADVICE] 502 Bad Gateway detected! This means the MinIO service at the endpoint is either down or not accepting requests on the expected port.`);
        }
      }
    }
  }

  get client() {
    return this.s3Client;
  }
}
