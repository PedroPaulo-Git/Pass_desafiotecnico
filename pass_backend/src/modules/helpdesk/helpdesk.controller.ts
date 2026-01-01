import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
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
  findAll() {
    return this.helpdeskService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by id' })
  findOne(@Param('id') id: string) {
    return this.helpdeskService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ticket' })
  update(@Param('id') id: string, @Body() updateHelpdeskDto: UpdateHelpdeskDto) {
    return this.helpdeskService.update(id, updateHelpdeskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket' })
  remove(@Param('id') id: string) {
    return this.helpdeskService.remove(id);
  }
}
