import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseUUIDPipe, ValidationPipe, UseInterceptors, UploadedFile, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { HelpdeskService } from './helpdesk.service';
import { CreateHelpdeskDto, UpdateHelpdeskDto } from './dto/helpdesk.dto';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';
import { AttachmentResponseDto } from './dto/attachment.dto';

@ApiTags('helpdesk')
@Controller('helpdesk')
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @Post()
  @ApiOperation({ summary: 'Create ticket' })
  create(@Body() createHelpdeskDto: CreateHelpdeskDto) {
    return this.helpdeskService.create(createHelpdeskDto);
  }

  @Get()
  @ApiOperation({ summary: 'List tickets' })
  findAll(@Query() query: any) {
    return this.helpdeskService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.helpdeskService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ticket' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHelpdeskDto: UpdateHelpdeskDto,
  ) {
    return this.helpdeskService.update(id, updateHelpdeskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.helpdeskService.remove(id);
  }

  // --- Ticket Messages ---

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send message to ticket' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: MessageResponseDto })
  createMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) createMessageDto: CreateMessageDto,
  ) {
    return this.helpdeskService.createMessage(id, createMessageDto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List ticket messages' })
  @ApiResponse({ status: 200, description: 'List of messages', type: [MessageResponseDto] })
  findAllMessages(@Param('id', ParseUUIDPipe) id: string) {
    return this.helpdeskService.findAllMessages(id);
  }

  @Delete(':id/messages/:messageIndex')
  @ApiOperation({ summary: 'Delete message from ticket' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  deleteMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('messageIndex') messageIndex: string,
  ) {
    return this.helpdeskService.deleteMessage(id, parseInt(messageIndex, 10));
  }

  // --- Ticket Attachments ---

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload attachment to ticket' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.helpdeskService.uploadAttachment(id, file);
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'List ticket attachments' })
  @ApiResponse({ status: 200, type: [AttachmentResponseDto] })
  async listAttachments(@Param('id', ParseUUIDPipe) id: string) {
    return this.helpdeskService.listAttachments(id);
  }

  @Get(':id/attachments/:filename')
  @ApiOperation({ summary: 'Download attachment from ticket' })
  @ApiResponse({ status: 200, description: 'File stream' })
  async downloadAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, contentType, originalName } = await this.helpdeskService.getAttachment(id, filename);
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${originalName}"`,
    });

    return new StreamableFile(stream);
  }

  // --- Ticket History ---

  @Get(':id/history')
  @ApiOperation({ summary: 'Get ticket history' })
  @ApiResponse({ status: 200, description: 'Ticket history log' })
  findAllHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.helpdeskService.findAllHistory(id);
  }
}
