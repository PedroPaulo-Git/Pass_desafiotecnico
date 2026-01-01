import { IsString, IsInt, IsEnum, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FuelType } from '../../../common/enums';

export class CreateFuelingDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  provider: string;

  @ApiProperty({ enum: FuelType })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty()
  @IsNumber()
  liters: number;

  @ApiProperty()
  @IsNumber()
  totalValue: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsInt()
  odometer: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}

import { PartialType } from '@nestjs/swagger';

export class UpdateFuelingDto extends PartialType(CreateFuelingDto) {}
