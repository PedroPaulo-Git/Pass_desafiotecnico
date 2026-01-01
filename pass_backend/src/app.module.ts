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
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
