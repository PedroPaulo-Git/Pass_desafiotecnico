import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseUUIDPipe, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HelpdeskService } from './helpdesk.service';
import { CreateHelpdeskDto, UpdateHelpdeskDto } from './dto/helpdesk.dto';

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
  createMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() messageData: any,
  ) {
    return this.helpdeskService.createMessage(id, messageData);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List ticket messages' })
  findAllMessages(@Param('id', ParseUUIDPipe) id: string) {
    return this.helpdeskService.findAllMessages(id);
  }
}
