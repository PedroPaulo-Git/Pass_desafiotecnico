import { IsString, IsInt, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleStatus, VehicleCategory, VehicleClassification, FuelType } from '../../../common/enums';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  internalId?: string;

  @ApiProperty()
  @IsString()
  plate: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  renavam?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  chassis?: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsInt()
  year: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ enum: VehicleCategory })
  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @ApiProperty({ enum: VehicleClassification })
  @IsEnum(VehicleClassification)
  classification: VehicleClassification;

  @ApiProperty()
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  doors?: number;

  @ApiProperty({ enum: FuelType })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  currentKm?: number;

  @ApiProperty({ enum: VehicleStatus, default: VehicleStatus.LIBERADO })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}
