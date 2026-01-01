import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Fueling } from './fueling.entity';
import { CreateFuelingDto, UpdateFuelingDto } from './dto/fueling.dto';

@Injectable()
export class FuelingsService {
  constructor(
    @InjectRepository(Fueling)
    private fuelingsRepository: Repository<Fueling>,
  ) {}

  async create(createFuelingDto: CreateFuelingDto): Promise<Fueling> {
    const fueling = this.fuelingsRepository.create(createFuelingDto as unknown as DeepPartial<Fueling>);
    return this.fuelingsRepository.save(fueling);
  }

  async findAll(vehicleId?: string): Promise<Fueling[]> {
    const where = vehicleId ? { vehicleId } : {};
    return this.fuelingsRepository.find({ where, order: { date: 'DESC' } });
  }

  async findOne(id: string): Promise<Fueling> {
    const fueling = await this.fuelingsRepository.findOne({ where: { id } });
    if (!fueling) {
      throw new NotFoundException(`Fueling with ID ${id} not found`);
    }
    return fueling;
  }

  async update(id: string, updateFuelingDto: UpdateFuelingDto): Promise<Fueling> {
    const fueling = await this.findOne(id);
    this.fuelingsRepository.merge(fueling, updateFuelingDto as any);
    return this.fuelingsRepository.save(fueling);
  }

  async remove(id: string): Promise<void> {
    const fueling = await this.findOne(id);
    await this.fuelingsRepository.remove(fueling);
  }
}
