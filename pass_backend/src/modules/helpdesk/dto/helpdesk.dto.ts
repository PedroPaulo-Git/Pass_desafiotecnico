import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HelpdeskCategory, HelpdeskPriority, HelpdeskStatus, HelpdeskModule, HelpdeskEnvironment } from '../../../common/enums';

export class CreateHelpdeskDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  ticketNumber?: string;

  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: HelpdeskCategory })
  @IsEnum(HelpdeskCategory)
  category: HelpdeskCategory;

  @ApiProperty({ enum: HelpdeskPriority, default: HelpdeskPriority.BAIXA })
  @IsEnum(HelpdeskPriority)
  @IsOptional()
  priority?: HelpdeskPriority;

  @ApiProperty({ enum: HelpdeskStatus, default: HelpdeskStatus.ABERTO })
  @IsEnum(HelpdeskStatus)
  @IsOptional()
  status?: HelpdeskStatus;

  @ApiProperty({ enum: HelpdeskModule })
  @IsEnum(HelpdeskModule)
  @IsOptional()
  module?: HelpdeskModule;

  @ApiProperty({ enum: HelpdeskEnvironment, default: HelpdeskEnvironment.WEB })
  @IsEnum(HelpdeskEnvironment)
  @IsOptional()
  environment?: HelpdeskEnvironment;

  @ApiProperty()
  @IsString()
  bucketPath: string;
}

import { PartialType } from '@nestjs/swagger';

export class UpdateHelpdeskDto extends PartialType(CreateHelpdeskDto) {}
