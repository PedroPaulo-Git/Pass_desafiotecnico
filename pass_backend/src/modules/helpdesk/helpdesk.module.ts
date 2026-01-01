import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpdeskService } from './helpdesk.service';
import { HelpdeskController } from './helpdesk.controller';
import { Helpdesk } from './helpdesk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Helpdesk])],
  controllers: [HelpdeskController],
  providers: [HelpdeskService],
  exports: [HelpdeskService],
})
export class HelpdeskModule {}
