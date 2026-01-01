import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Incident } from './incident.entity';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    const incident = this.incidentsRepository.create(createIncidentDto as unknown as DeepPartial<Incident>);
    return this.incidentsRepository.save(incident);
  }

  async findAll(vehicleId?: string): Promise<Incident[]> {
    const where = vehicleId ? { vehicleId } : {};
    return this.incidentsRepository.find({ where, order: { date: 'DESC' } });
  }

  async findOne(id: string): Promise<Incident> {
    const incident = await this.incidentsRepository.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    return incident;
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto): Promise<Incident> {
    const incident = await this.findOne(id);
    this.incidentsRepository.merge(incident, updateIncidentDto as any);
    return this.incidentsRepository.save(incident);
  }

  async remove(id: string): Promise<void> {
    const incident = await this.findOne(id);
    await this.incidentsRepository.remove(incident);
  }
}
