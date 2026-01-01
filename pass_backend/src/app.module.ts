import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { FuelingsModule } from './modules/fuelings/fuelings.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { HelpdeskModule } from './modules/helpdesk/helpdesk.module';
import { VehicleDocumentsModule } from './modules/vehicle-documents/vehicle-documents.module';
import { MinioModule } from './modules/minio/minio.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   url: process.env.DATABASE_URL,
    //   host: process.env.DATABASE_URL ? undefined : (process.env.DATABASE_HOST || 'localhost'),
    //   port: process.env.DATABASE_URL ? undefined : (parseInt(process.env.DATABASE_PORT, 10) || 5432),
    //   username: process.env.DATABASE_URL ? undefined : (process.env.DATABASE_USER || 'pass_user'),
    //   password: process.env.DATABASE_URL ? undefined : (process.env.DATABASE_PASSWORD || 'pass_password'),
    //   database: process.env.DATABASE_URL ? undefined : (process.env.DATABASE_NAME || 'pass_db'),
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true, // Auto-create tables (dev only)
    //   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          url: url,
          host: url ? undefined : (configService.get<string>('DATABASE_HOST') || 'localhost'),
          port: url ? undefined : (configService.get<number>('DATABASE_PORT') || 5432),
          username: url ? undefined : (configService.get<string>('DATABASE_USER') || 'pass_user'),
          password: url ? undefined : (configService.get<string>('DATABASE_PASSWORD') || 'pass_password'),
          database: url ? undefined : (configService.get<string>('DATABASE_NAME') || 'pass_db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: (configService.get<string>('NODE_ENV') === 'production' || !!url) 
               ? { rejectUnauthorized: false } 
               : false,
        };
      },
    }),
    UsersModule,
    VehiclesModule,
    FuelingsModule,
    IncidentsModule,
    HelpdeskModule,
    VehicleDocumentsModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
