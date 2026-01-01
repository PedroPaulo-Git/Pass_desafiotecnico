import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SeverityLevel } from '../../../common/enums';

export class CreateIncidentDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
  classification: string;

  @ApiProperty({ enum: SeverityLevel })
  @IsEnum(SeverityLevel)
  severity: SeverityLevel;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}

import { PartialType } from '@nestjs/swagger';

export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {}
