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

    // Auto-fix for Render public domains: They MUST use HTTPS
    if (isPublicRender) {
      finalUseSsl = true;
      this.logger.log('Detecting public Render domain. Forcing HTTPS to avoid 301 redirects.');
    }

    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      const protocol = finalUseSsl ? 'https' : 'http';
      endpoint = `${protocol}://${endpoint}`;

      if (isInternal) {
        endpoint = `${endpoint}:${port}`;
        this.logger.log(`Using INTERNAL strategy: ${endpoint}`);
      } else {
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
    this.setupMinioInBackground();
  }

  private setupMinioInBackground() {
    (async () => {
      // Espera inicial para o NestJS subir
      await new Promise(r => setTimeout(r, 2000));
      
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
      
      // ========== PHASE 1: Direct SDK Connection (Initial Attempt) ==========
      this.logger.log('┌─────────────────────────────────────────────────────────────┐');
      this.logger.log('│ PHASE 1: Direct S3 SDK Connection                           │');
      this.logger.log('└─────────────────────────────────────────────────────────────┘');
      
      let allBucketsReady = true;
      
      // Aumentado para 15 tentativas de 4s = 60 segundos de buffer inicial
      for (const bucket of buckets) {
        const success = await this.initializeBucket(bucket, 3, 4000); 
        if (!success) {
          allBucketsReady = false;
        }
      }
      
      if (allBucketsReady) {
        this.logComplete();
        return;
      }

      // ========== PHASE 2: External Proxy Wake-Up (Trigger Only) ==========
      // Se falhar a fase 1, tentamos acordar via proxy, mas NÃO abortamos se o proxy falhar.
      this.logger.log('');
      this.logger.log('┌─────────────────────────────────────────────────────────────┐');
      this.logger.log('│ PHASE 2: External Proxy Wake-Up (Trigger)                   │');
      this.logger.log('└─────────────────────────────────────────────────────────────┘');
      
      // Executa o wakeup, mas ignora o resultado booleano. O importante é o "ping".
      await this.tryExternalProxyWakeUp();

      // ========== PHASE 3: Final Persistence (The "Catch-All") ==========
      // Agora tentamos conectar de novo, independente do resultado do Proxy.
      // O Proxy pode ter falhado (502), mas ter acordado a máquina.
      this.logger.log('');
      this.logger.log('┌─────────────────────────────────────────────────────────────┐');
      this.logger.log('│ PHASE 3: Final Persistence (Waiting for Service Boot)       │');
      this.logger.log('└─────────────────────────────────────────────────────────────┘');
      
      // Loop final agressivo: 20 tentativas de 5s = +100 segundos de espera
      // Total acumulado de espera: 60s (P1) + ~30s (P2) + 100s (P3) = ~3 minutos (Suficiente para Render)
      for (const bucket of buckets) {
        this.logger.log(`[MINIO] Final check for bucket "${bucket}"...`);
        const finalSuccess = await this.initializeBucket(bucket, 5, 5000);
        if (!finalSuccess) {
            this.logger.error(`[MINIO] ❌ CRITICAL: Could not connect to bucket "${bucket}" after all phases.`);
        }
      }

      this.logComplete();

    })().catch(err => {
      this.logger.error(`[MINIO] ❌ Background init error: ${err.message}`);
    });
  }

  private logComplete() {
    this.logger.log('');
    this.logger.log('╔═══════════════════════════════════════════════════════════╗');
    this.logger.log('║            ✅ MINIO INITIALIZATION COMPLETE               ║');
    this.logger.log('╚═══════════════════════════════════════════════════════════╝');
    this.logger.log('');
  }

  /**
   * Try to wake up MinIO using external proxy services
   */
  private async tryExternalProxyWakeUp(): Promise<boolean> {
    const targetUrl = encodeURIComponent(this.baseUrl);
    
    const proxyServices = [
      { name: 'AllOrigins', url: `https://api.allorigins.win/get?url=${targetUrl}` },
      { name: 'CorsProxy', url: `https://corsproxy.io/?${this.baseUrl}` },
    ];
    
    // Reduzi tentativas aqui para ser mais rápido e ir logo para a Phase 3
    const maxAttempts = 2; 
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.log(`[PROXY] 📡 Attempt ${attempt}/${maxAttempts}...`);
      
      for (const proxy of proxyServices) {
        try {
          this.logger.log(`[PROXY] Pinging via ${proxy.name}...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
          
          const response = await fetch(proxy.url, {
            method: 'GET',
            headers: { 'User-Agent': 'MinIO-Waker/1.0' },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          this.logger.log(`[PROXY] ${proxy.name} returned status: ${response.status}`);
          
          // Se retornou 200, 500, 502, 503... o servidor foi atingido (ou o load balancer).
          // Isso já conta como "acordar".
          if (response.status) {
             this.logger.log(`[PROXY] ✅ Signal sent via ${proxy.name}. Render should be waking up.`);
             // Damos um pequeno tempo para o Render processar o sinal
             await new Promise(r => setTimeout(r, 5000));
             return true; 
          }

        } catch (error: any) {
          this.logger.warn(`[PROXY] ${proxy.name} request failed: ${error.message?.substring(0, 40)}`);
        }
      }
      
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    
    this.logger.warn('[PROXY] Proxies failed to get a clean response, but traffic may have triggered wakeup. Proceeding to Phase 3.');
    return false;
  }

  private async initializeBucket(bucketName: string, maxAttempts: number = 10, retryDelay: number = 3000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) this.logger.log(`[MINIO] Checking bucket "${bucketName}" (attempt ${attempt}/${maxAttempts})...`);
        
        // Try to check if bucket exists using S3 SDK
        await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
        this.logger.log(`[MINIO] ✅ Bucket "${bucketName}" exists and is accessible!`);
        return true;
        
      } catch (error: any) {
        const statusCode = error?.$metadata?.httpStatusCode;
        const errorName = error?.name;
        const errorMessage = error?.message || '';
        
        // CORREÇÃO CRÍTICA: Detectar erro de XML parsing (HTML retornado pelo Load Balancer 502)
        const isXmlParseError = errorMessage.includes('Expected closing tag') || errorMessage.includes('Unexpected token');

        // Bucket doesn't exist - create it
        if (errorName === 'NotFound' || statusCode === 404) {
          this.logger.log(`[MINIO] Bucket "${bucketName}" not found. Creating...`);
          try {
            await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
            this.logger.log(`[MINIO] ✅ Bucket "${bucketName}" created successfully!`);
            return true;
          } catch (createErr: any) {
            if (createErr?.name === 'BucketAlreadyOwnedByYou' || createErr?.name === 'BucketAlreadyExists') {
              this.logger.log(`[MINIO] ✅ Bucket "${bucketName}" already exists!`);
              return true;
            }
            this.logger.error(`[MINIO] ❌ Failed to create bucket: ${createErr.message}`);
            return false;
          }
        }
        
        // Service unavailable (502/503/504) OR XML Parsing Error (que é um 502 disfarçado)
        if (statusCode === 502 || statusCode === 503 || statusCode === 504 || isXmlParseError) {
          const msg = isXmlParseError ? 'Received HTML instead of XML (Service likely waking up)' : `Status ${statusCode}`;
          this.logger.warn(`[MINIO] Connection pending: ${msg}. Waiting ${retryDelay/1000}s...`);
          
          if (attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, retryDelay));
            continue;
          }
        }
        
        // Connection errors
        if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT' || errorMessage.includes('fetch failed')) {
          this.logger.warn(`[MINIO] Connection failed: ${error.code || errorMessage.substring(0, 30)}. Retrying in ${retryDelay/1000}s...`);
          
          if (attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, retryDelay));
            continue;
          }
        }
        
        // Unknown error - log and continue retrying if possible
        this.logger.error(`[MINIO] ❌ Unexpected error: ${errorName} (${statusCode}) - ${errorMessage.substring(0, 100)}`);
        
        if (attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, retryDelay));
            continue;
        }
      }
    }
    
    return false;
  }

  async isMinioAvailable(): Promise<boolean> {
    try {
      const bucket = this.configService.get<string>('MINIO_BUCKET') || 'pass-vehicles';
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      return true;
    } catch {
      return false;
    }
  }

  async ensureBucketExists(bucketName: string): Promise<void> {
    // Usa uma tentativa curta para chamadas manuais
    const success = await this.initializeBucket(bucketName, 3, 1000);
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