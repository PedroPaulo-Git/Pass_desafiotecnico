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

  async waitForMinioToWakeUp(retries = 30) {
    const https = await import('https');
    const http = await import('http');
    const { URL } = await import('url');
    
    this.logger.log(`[WAKE UP] Starting NATIVE HTTPS wake-up sequence for: ${this.baseUrl}`);
    
    const parsedUrl = new URL(this.baseUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const hostname = parsedUrl.hostname;
    const port = parsedUrl.port || (isHttps ? 443 : 80);
    
    const paths = ['/', '/minio/health/live', '/minio/health/ready'];
    
    for (let i = 0; i < retries; i++) {
      const path = paths[i % paths.length];
      
      try {
        const statusCode = await new Promise<number>((resolve) => {
          const options = {
            hostname,
            port: Number(port),
            path: `${path}?t=${Date.now()}`,
            method: 'GET',
            timeout: 30000, // 30 second timeout
            headers: {
              'Host': hostname,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
              'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'none',
              'Sec-Fetch-User': '?1',
              'Cache-Control': 'max-age=0',
              'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"'
            },
            // Critical TLS options for proper SNI
            ...(isHttps ? {
              servername: hostname, // SNI - Server Name Indication
              rejectUnauthorized: true,
              minVersion: 'TLSv1.2' as const,
            } : {})
          };
          
          this.logger.debug(`[WAKE UP] Attempt ${i + 1}/${retries}: ${isHttps ? 'https' : 'http'}://${hostname}:${port}${path}`);
          
          const client = isHttps ? https : http;
          const req = client.request(options, (res) => {
            // Consume response to complete the request
            res.on('data', () => {});
            res.on('end', () => {
              resolve(res.statusCode || 0);
            });
          });
          
          req.on('error', (err: any) => {
            this.logger.debug(`[WAKE UP] Request error: ${err.message}`);
            resolve(0);
          });
          
          req.on('timeout', () => {
            this.logger.debug(`[WAKE UP] Request timeout`);
            req.destroy();
            resolve(0);
          });
          
          req.end();
        });
        
        this.logger.debug(`[WAKE UP] Response status: ${statusCode}`);
        
        // Any non-5xx response means the service is awake
        if (statusCode > 0 && statusCode < 500) {
          this.logger.log(`[WAKE UP] ✅ MinIO is AWAKE! (Status: ${statusCode})`);
          // Give it 2 more seconds to fully stabilize
          await new Promise(r => setTimeout(r, 2000));
          return;
        }
        
        this.logger.warn(`[WAKE UP] MinIO returned ${statusCode}, still waking... (${i + 1}/${retries})`);
        
      } catch (error: any) {
        this.logger.warn(`[WAKE UP] Error: ${error.message} (${i + 1}/${retries})`);
      }
      
      // Wait 5 seconds between attempts
      await new Promise(r => setTimeout(r, 5000));
    }
    
    this.logger.error('[WAKE UP] ❌ Failed to wake up MinIO after all attempts.');
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
