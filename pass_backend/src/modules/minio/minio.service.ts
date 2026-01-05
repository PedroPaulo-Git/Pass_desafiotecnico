import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { S3Client, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private s3Client: S3Client;
  private baseUrl: string;

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
    
    // 1. Determine if it's a public Render URL vs Internal/Docker
    const isPublicRender = rawEndpoint.includes('.onrender.com');
    const isInternal = !rawEndpoint.includes('.') || 
                       rawEndpoint === 'localhost' || 
                       rawEndpoint === '127.0.0.1' || 
                       rawEndpoint === 'minio';

    // 2. Build the base protocol and hostname
    let endpoint = rawEndpoint.trim().replace(/\/$/, "");
    let finalUseSsl = sslEnv === 'true';

    // Auto-fix for Render public domains: They MUST use HTTPS (301 redirect otherwise)
    if (isPublicRender) {
      finalUseSsl = true;
      this.logger.log('Detecting public Render domain. Forcing HTTPS to avoid 301 redirects.');
    }

    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      const protocol = finalUseSsl ? 'https' : 'http';
      endpoint = `${protocol}://${endpoint}`;

      // 3. Port Logic:
      // - Public Render domains DO NOT expose port 9000 externally. They use 443 (default).
      // - Internal/Docker hostnames DO use port 9000.
      if (isInternal) {
        endpoint = `${endpoint}:${port}`;
        this.logger.log(`Using INTERNAL strategy: ${endpoint}`);
      } else {
        // For public domains, only append if it's not standard 80/443
        if (port !== '9000' && port !== '80' && port !== '443') {
           endpoint = `${endpoint}:${port}`;
        }
        this.logger.log(`Using EXTERNAL strategy: ${endpoint}`);
      }
    }

    const accessKey = accessKeyEnv || rootUserEnv || 'minioadmin';
    const secretKey = secretKeyEnv || rootPassEnv || 'minioadmin123';

    this.baseUrl = endpoint;

    this.logger.log(`Final MinIO Client Endpoint: ${endpoint}`);
    this.logger.log(`MinIO AccessKey starts with: ${accessKey?.substring(0, 3)}...`);
    this.logger.log(`MinIO Use SSL: ${finalUseSsl}`);

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
    // Attempt to wake up MinIO first
    await this.waitForMinioToWakeUp();
    
    const vehiclesBucket = this.configService.get<string>('MINIO_BUCKET') || 'pass-vehicles';
    const helpdeskBucket = this.configService.get<string>('MINIO_BUCKET_HELPDESK') || 'helpdesk';

    this.logger.log('--- MINIO BUCKET INITIALIZATION ---');
    await this.ensureBucketExists(vehiclesBucket);
    await this.ensureBucketExists(helpdeskBucket);
    this.logger.log('-----------------------------------');
  }

  async waitForMinioToWakeUp(retries = 20) {
    this.logger.log(`[WAKE UP] Starting EXTERNAL PROXY wake-up sequence for: ${this.baseUrl}`);
    
    // Strategy: Use external proxy services to make the request appear to come from outside Render
    // This bypasses any internal service-to-service blocking that Render might have
    const targetUrl = encodeURIComponent(this.baseUrl);
    
    const proxyUrls = [
      // Direct request (still try it)
      this.baseUrl,
      // AllOrigins proxy - makes request from their servers
      `https://api.allorigins.win/get?url=${targetUrl}`,
      // Alternative: corsproxy.io
      `https://corsproxy.io/?${this.baseUrl}`,
    ];
    
    for (let i = 0; i < retries; i++) {
      for (const proxyUrl of proxyUrls) {
        try {
          const isProxy = proxyUrl !== this.baseUrl;
          const displayUrl = isProxy ? `PROXY -> ${this.baseUrl}` : this.baseUrl;
          
          this.logger.debug(`[WAKE UP] Attempt ${i + 1}/${retries} via: ${isProxy ? 'EXTERNAL PROXY' : 'DIRECT'}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*',
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          this.logger.debug(`[WAKE UP] Response from ${isProxy ? 'proxy' : 'direct'}: ${response.status}`);
          
          // For proxies, a 200 means the proxy worked, which means it reached our service
          // For direct, anything < 500 means the service is awake
          if (isProxy && response.ok) {
            // Proxy returned 200, now let's verify the actual service
            const directCheck = await this.checkMinioDirectly();
            if (directCheck) {
              this.logger.log(`[WAKE UP] ✅ MinIO woke up via EXTERNAL PROXY!`);
              await new Promise(r => setTimeout(r, 2000));
              return;
            }
          } else if (!isProxy && response.status > 0 && response.status < 500) {
            this.logger.log(`[WAKE UP] ✅ MinIO is AWAKE via direct request! (Status: ${response.status})`);
            await new Promise(r => setTimeout(r, 2000));
            return;
          }
        } catch (error: any) {
          this.logger.debug(`[WAKE UP] Request failed: ${error.message?.substring(0, 50)}`);
        }
      }
      
      this.logger.warn(`[WAKE UP] MinIO still sleeping... waiting 5s (${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, 5000));
    }
    
    this.logger.error('[WAKE UP] ❌ Failed to wake up MinIO. The service may need manual activation.');
  }

  private async checkMinioDirectly(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}/minio/health/live`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.status > 0 && response.status < 500;
    } catch {
      return false;
    }
  }

  async ensureBucketExists(bucketName: string, retries = 30) {
    for (let i = 0; i < retries; i++) {
      try {
        this.logger.debug(`[MINIO DEBUG] Attempt ${i + 1}/${retries}: Sending HeadBucketCommand for: ${bucketName}`);
        await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
        this.logger.log(`[MINIO SUCCESS] Bucket exists: ${bucketName}`);
        return; // Success, exit loop
      } catch (error: any) {
        const statusCode = error?.$metadata?.httpStatusCode;
        const isParsingError = error?.message?.includes('Expected closing tag') || error?.message?.includes('Deserialization error');
        
        // If 404, we create it
        if (error?.name === 'NotFound' || statusCode === 404) {
          try {
            this.logger.log(`[MINIO] Bucket not found. Creating bucket: ${bucketName}`);
            await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
            this.logger.log(`[MINIO] Bucket created successfully: ${bucketName}`);
            return;
          } catch (createError: any) {
            this.logger.error(`[MINIO FATAL] Failed to create bucket ${bucketName}: ${createError?.message}`);
            return; // Don't retry creation if it failed with something else
          }
        }

        // If it's a "wake-up" candidate (502, 503, ETIMEDOUT, etc.) OR a parsing error (Render HTML error page)
        const isRetryable = statusCode === 502 || statusCode === 503 || isParsingError || error?.code === 'ETIMEDOUT' || error?.code === 'ECONNREFUSED';
        
        if (isRetryable && i < retries - 1) {
          this.logger.warn(`[MINIO RETRY] Service might be sleeping (Status ${statusCode || 'HTML Error'}). Retrying in 10s... (${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 10000));
          continue;
        }

        this.logger.error(`[MINIO ERROR] Failed checking bucket "${bucketName}" after ${i + 1} attempts`);
        this.logger.error(`[MINIO ERROR] Name: ${error?.name}, Status: ${statusCode}, Message: ${error?.message}`);
        
        if (statusCode === 502 || isParsingError) {
          this.logger.error(`[MINIO ADVICE] 502 Bad Gateway or HTML Error! Render might be waking up the service or Port 9000 is wrong for external access. Please try again in 60 seconds.`);
        }
        break; // Stop if not retryable or out of retries
      }
    }
  }

  get client() {
    return this.s3Client;
  }

  async getPresignedUrl(bucketName: string, objectKey: string, expiresIn: number = 3600): Promise<string> {
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${objectKey}: ${error.message}`);
      throw error;
    }
  }
}
