import { IsString, IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDocumentDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDateString()
  expiryDate: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  alertDays?: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  activeAlert?: boolean;
}

import { PartialType } from '@nestjs/swagger';

export class UpdateVehicleDocumentDto extends PartialType(CreateVehicleDocumentDto) {}
