import { ApiProperty } from '@nestjs/swagger';

export class AttachmentResponseDto {
  @ApiProperty({ example: '2026-01-01_erro-agendamento.png' })
  filename: string;

  @ApiProperty({ example: 102450, description: 'Size in bytes' })
  size: number;

  @ApiProperty({ example: '2026-01-01T10:32:01.000Z' })
  uploadedAt: string;

  @ApiProperty({ example: 'http://minio:9000/helpdesk/...' })
  url: string;
}
