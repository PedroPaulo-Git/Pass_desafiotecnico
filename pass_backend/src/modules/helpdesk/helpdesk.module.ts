import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpdeskService } from './helpdesk.service';
import { HelpdeskController } from './helpdesk.controller';
import { Helpdesk } from './helpdesk.entity';
import { User } from '../users/user.entity';
import { HelpdeskHistory } from './history.entity';
import { MinioModule } from '../minio/minio.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Helpdesk, User, HelpdeskHistory]),
    MinioModule,
    UsersModule,
  ],
  controllers: [HelpdeskController],
  providers: [HelpdeskService],
  exports: [HelpdeskService],
})
export class HelpdeskModule {}
