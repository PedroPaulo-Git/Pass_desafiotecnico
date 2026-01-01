import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';

@ApiTags('incidents')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create incident' })
  create(@Body() createIncidentDto: CreateIncidentDto) {
    return this.incidentsService.create(createIncidentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List incidents' })
  @ApiQuery({ name: 'vehicleId', required: false })
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.incidentsService.findAll(vehicleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident from id' })
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update incident' })
  update(@Param('id') id: string, @Body() updateIncidentDto: UpdateIncidentDto) {
    return this.incidentsService.update(id, updateIncidentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete incident' })
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
}
