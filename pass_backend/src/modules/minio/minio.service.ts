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
    // Non-blocking: Run MinIO setup in background
    this.setupMinioInBackground();
  }

  private setupMinioInBackground() {
    // Don't await - let NestJS continue starting
    (async () => {
      // Wait for NestJS to finish bootstrapping
      await new Promise(r => setTimeout(r, 1000));
      
      this.logger.log('');
      this.logger.log('╔═══════════════════════════════════════════════════════════╗');
      this.logger.log('║            🚀 MINIO INITIALIZATION STARTING               ║');
      this.logger.log('╚═══════════════════════════════════════════════════════════╝');
      this.logger.log(`║ Endpoint: ${this.baseUrl}`);
      this.logger.log('');
      
      const buckets = [
        this.configService.get<string>('MINIO_BUCKET') || 'pass-vehicles',
        this.configService.get<string>('MINIO_BUCKET_HELPDESK') || 'helpdesk'
      ];
      
      // ========== PHASE 1: Direct SDK Connection ==========
      this.logger.log('┌─────────────────────────────────────────────────────────────┐');
      this.logger.log('│ PHASE 1: Direct S3 SDK Connection                           │');
      this.logger.log('└─────────────────────────────────────────────────────────────┘');
      
      let allBucketsReady = true;
      
      for (const bucket of buckets) {
        const success = await this.initializeBucket(bucket);
        if (!success) {
          allBucketsReady = false;
        }
      }
      
      // ========== PHASE 2: External Proxy Fallback (if needed) ==========
      if (!allBucketsReady) {
        this.logger.log('');
        this.logger.log('┌─────────────────────────────────────────────────────────────┐');
        this.logger.log('│ PHASE 2: External Proxy Wake-Up (Fallback)                  │');
        this.logger.log('└─────────────────────────────────────────────────────────────┘');
        
        const wokenUp = await this.tryExternalProxyWakeUp();
        
        if (wokenUp) {
          this.logger.log('');
          this.logger.log('┌─────────────────────────────────────────────────────────────┐');
          this.logger.log('│ PHASE 3: Retry Bucket Initialization After Wake-Up         │');
          this.logger.log('└─────────────────────────────────────────────────────────────┘');
          
          for (const bucket of buckets) {
            await this.initializeBucket(bucket);
          }
        } else {
          this.logger.warn('[MINIO] ⚠️ Could not wake up MinIO via external proxy');
          this.logger.warn(`[MINIO] 💡 Manual action: Visit ${this.baseUrl} in your browser`);
        }
      }
      
      this.logger.log('');
      this.logger.log('╔═══════════════════════════════════════════════════════════╗');
      this.logger.log('║            ✅ MINIO INITIALIZATION COMPLETE               ║');
      this.logger.log('╚═══════════════════════════════════════════════════════════╝');
      this.logger.log('');
    })().catch(err => {
      this.logger.error(`[MINIO] ❌ Background init error: ${err.message}`);
    });
  }

  /**
   * Try to wake up MinIO using external proxy services
   * This makes the request appear to come from outside Render's network
   */
  private async tryExternalProxyWakeUp(): Promise<boolean> {
    const targetUrl = encodeURIComponent(this.baseUrl);
    
    const proxyServices = [
      { name: 'AllOrigins', url: `https://api.allorigins.win/get?url=${targetUrl}` },
      { name: 'CorsProxy', url: `https://corsproxy.io/?${this.baseUrl}` },
    ];
    
    const maxAttempts = 3;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.log(`[PROXY] 📡 Attempt ${attempt}/${maxAttempts}...`);
      
      for (const proxy of proxyServices) {
        try {
          this.logger.log(`[PROXY] Trying ${proxy.name}...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);
          
          const response = await fetch(proxy.url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*',
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          this.logger.log(`[PROXY] ${proxy.name} returned: ${response.status}`);
          
          if (response.ok) {
            // Proxy reached the service! But Render takes time to fully boot.
            // Wait and then verify multiple times
            this.logger.log(`[PROXY] ✅ ${proxy.name} reached MinIO! Waiting 15s for boot...`);
            await new Promise(r => setTimeout(r, 15000));
            
            // Try to verify MinIO is actually ready (3 attempts, 5s apart)
            for (let verifyAttempt = 1; verifyAttempt <= 3; verifyAttempt++) {
              this.logger.log(`[PROXY] Verifying MinIO status (${verifyAttempt}/3)...`);
              const isUp = await this.verifyMinioIsUp();
              if (isUp) {
                this.logger.log(`[PROXY] 🎉 MinIO is LIVE via ${proxy.name}!`);
                return true;
              }
              if (verifyAttempt < 3) {
                this.logger.log(`[PROXY] Not ready yet, waiting 5s...`);
                await new Promise(r => setTimeout(r, 5000));
              }
            }
            
            this.logger.warn(`[PROXY] MinIO didn't respond after wakeup. Continuing...`);
          }
        } catch (error: any) {
          this.logger.warn(`[PROXY] ${proxy.name} failed: ${error.message?.substring(0, 40)}`);
        }
      }
      
      // Wait before next round of attempts
      if (attempt < maxAttempts) {
        this.logger.log(`[PROXY] ⏳ Waiting 10s before next attempt...`);
        await new Promise(r => setTimeout(r, 10000));
      }
    }
    
    return false;
  }

  /**
   * Quick check if MinIO is responding
   */
  private async verifyMinioIsUp(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
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

  private async initializeBucket(bucketName: string): Promise<boolean> {
    const maxAttempts = 10;
    const retryDelay = 3000; // 3 seconds between attempts
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(`[MINIO] Checking bucket "${bucketName}" (attempt ${attempt}/${maxAttempts})...`);
        
        // Try to check if bucket exists using S3 SDK
        await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
        this.logger.log(`[MINIO] ✅ Bucket "${bucketName}" exists and is accessible!`);
        return true;
        
      } catch (error: any) {
        const statusCode = error?.$metadata?.httpStatusCode;
        const errorName = error?.name;
        
        // Bucket doesn't exist - create it
        if (errorName === 'NotFound' || statusCode === 404) {
          this.logger.log(`[MINIO] Bucket "${bucketName}" not found. Creating...`);
          try {
            await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
            this.logger.log(`[MINIO] ✅ Bucket "${bucketName}" created successfully!`);
            return true;
          } catch (createErr: any) {
            // BucketAlreadyOwnedByYou means it exists (race condition)
            if (createErr?.name === 'BucketAlreadyOwnedByYou' || createErr?.name === 'BucketAlreadyExists') {
              this.logger.log(`[MINIO] ✅ Bucket "${bucketName}" already exists!`);
              return true;
            }
            this.logger.error(`[MINIO] ❌ Failed to create bucket: ${createErr.message}`);
            return false;
          }
        }
        
        // Service unavailable (502/503) - MinIO might be sleeping
        if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
          this.logger.warn(`[MINIO] MinIO returned ${statusCode} - service may be waking up...`);
          
          if (attempt < maxAttempts) {
            this.logger.log(`[MINIO] Waiting ${retryDelay / 1000}s before retry...`);
            await new Promise(r => setTimeout(r, retryDelay));
            continue;
          }
        }
        
        // Connection errors
        if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT' || error?.message?.includes('fetch failed')) {
          this.logger.warn(`[MINIO] Connection failed: ${error.code || error.message?.substring(0, 50)}`);
          
          if (attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, retryDelay));
            continue;
          }
        }
        
        // Unknown error - log and break
        this.logger.error(`[MINIO] ❌ Unexpected error: ${errorName} (${statusCode}) - ${error.message?.substring(0, 100)}`);
        
        if (attempt >= maxAttempts) {
          return false;
        }
        
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }
    
    return false;
  }

  /**
   * Public method to check if MinIO is currently available
   */
  async isMinioAvailable(): Promise<boolean> {
    try {
      const bucket = this.configService.get<string>('MINIO_BUCKET') || 'pass-vehicles';
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Legacy method - kept for compatibility but simplified
   */
  async ensureBucketExists(bucketName: string): Promise<void> {
    const success = await this.initializeBucket(bucketName);
    if (!success) {
      this.logger.warn(`[MINIO] Could not ensure bucket "${bucketName}" exists`);
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
