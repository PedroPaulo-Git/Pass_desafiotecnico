import { IsString, IsEnum, IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'The ID of the user sending the message' })
  @IsUUID()
  authorId: string;

  @ApiProperty({ enum: ['user', 'support'], description: 'Type of the author' })
  @IsEnum(['user', 'support'])
  authorType: 'user' | 'support';

  @ApiProperty({ description: 'The message content' })
  @IsString()
  message: string;

  @ApiProperty({ type: [String], required: false, description: 'List of attachment paths in MinIO' })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class MessageResponseDto {
  @ApiProperty()
  AuthorId: string;

  @ApiProperty()
  AuthorType: 'user' | 'support';

  @ApiProperty()
  Message: string;

  @ApiProperty()
  CreatedAt: string;

  @ApiProperty({ type: [String] })
  Attachments: string[];
}
