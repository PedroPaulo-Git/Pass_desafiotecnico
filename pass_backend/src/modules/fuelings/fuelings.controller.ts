import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FuelingsService } from './fuelings.service';
import { CreateFuelingDto, UpdateFuelingDto } from './dto/fueling.dto';

@ApiTags('fuelings')
@Controller('fuelings')
export class FuelingsController {
  constructor(private readonly fuelingsService: FuelingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create fueling' })
  create(@Body() createFuelingDto: CreateFuelingDto) {
    return this.fuelingsService.create(createFuelingDto);
  }

  @Get()
  @ApiOperation({ summary: 'List fuelings' })
  @ApiQuery({ name: 'vehicleId', required: false })
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.fuelingsService.findAll(vehicleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fueling from id' })
  findOne(@Param('id') id: string) {
    return this.fuelingsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update fueling' })
  update(@Param('id') id: string, @Body() updateFuelingDto: UpdateFuelingDto) {
    return this.fuelingsService.update(id, updateFuelingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete fueling' })
  remove(@Param('id') id: string) {
    return this.fuelingsService.remove(id);
  }
}
