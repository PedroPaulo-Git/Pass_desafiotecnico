import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VehicleDocumentsService } from './vehicle-documents.service';
import { CreateVehicleDocumentDto, UpdateVehicleDocumentDto } from './dto/vehicle-document.dto';

@ApiTags('documents')
@Controller('documents')
export class VehicleDocumentsController {
  constructor(private readonly documentsService: VehicleDocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create document' })
  create(@Body() createDto: CreateVehicleDocumentDto) {
    return this.documentsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  @ApiQuery({ name: 'vehicleId', required: false })
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.documentsService.findAll(vehicleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document from id' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document' })
  update(@Param('id') id: string, @Body() updateDto: UpdateVehicleDocumentDto) {
    return this.documentsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
