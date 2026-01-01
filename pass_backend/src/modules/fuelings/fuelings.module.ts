import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelingsService } from './fuelings.service';
import { FuelingsController } from './fuelings.controller';
import { Fueling } from './fueling.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fueling])],
  controllers: [FuelingsController],
  providers: [FuelingsService],
  exports: [FuelingsService],
})
export class FuelingsModule {}
