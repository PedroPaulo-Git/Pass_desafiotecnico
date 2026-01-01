import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { S3Client, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    const rawEndpoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = this.configService.get<string>('MINIO_PORT') || '9000';
    const useSsl = this.configService.get<string>('MINIO_USE_SSL') === 'true' || 
                   this.configService.get<string>('MINIO_ENDPOINT')?.includes('onrender.com') ||
                   false;
    
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') || 
                      this.configService.get<string>('MINIO_ROOT_USER') || 
                      'minioadmin';
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') || 
                      this.configService.get<string>('MINIO_ROOT_PASSWORD') || 
                      'minioadmin123';

    // Build endpoint URL correctly
    let endpoint = rawEndpoint.trim().replace(/\/$/, "");
    
    const isPublicDomain = endpoint.includes('.') && 
                           !endpoint.includes('localhost') && 
                           !endpoint.includes('127.0.0.1');

    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      // Use as provided if it's already a full URL
      this.logger.debug(`Using absolute MinIO endpoint: ${endpoint}`);
    } else {
      // Automatically determine SSL for public domains (like .onrender.com)
      const finalUseSsl = useSsl || isPublicDomain;
      const protocol = finalUseSsl ? 'https' : 'http';
      
      endpoint = `${protocol}://${endpoint}`;

      // Only append port if it's a local/internal service and port is provided
      if (port && port !== '80' && port !== '443' && !isPublicDomain) {
        endpoint = `${endpoint}:${port}`;
      }
    }

    this.logger.log(`Final MinIO Client Endpoint: ${endpoint}`);
    this.logger.log(`MinIO AccessKey starts with: ${accessKey?.substring(0, 3)}...`);
    this.logger.log(`MinIO Use SSL: ${endpoint.startsWith('https')}`);

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
