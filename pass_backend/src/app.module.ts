import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { FuelingsModule } from './modules/fuelings/fuelings.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { HelpdeskModule } from './modules/helpdesk/helpdesk.module';
import { VehicleDocumentsModule } from './modules/vehicle-documents/vehicle-documents.module';
import { MinioModule } from './modules/minio/minio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER || 'pass_user',
      password: process.env.DATABASE_PASSWORD || 'pass_password',
      database: process.env.DATABASE_NAME || 'pass_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create tables (dev only)
    }),
    UsersModule,
    VehiclesModule,
    FuelingsModule,
    IncidentsModule,
    HelpdeskModule,
    VehicleDocumentsModule,
    MinioModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
