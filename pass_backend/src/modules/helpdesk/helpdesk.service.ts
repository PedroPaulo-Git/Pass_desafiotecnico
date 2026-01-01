import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Helpdesk } from './helpdesk.entity';
import { CreateHelpdeskDto, UpdateHelpdeskDto } from './dto/helpdesk.dto';

@Injectable()
export class HelpdeskService {
  constructor(
    @InjectRepository(Helpdesk)
    private helpdeskRepository: Repository<Helpdesk>,
  ) {}

  async create(createHelpdeskDto: CreateHelpdeskDto): Promise<Helpdesk> {
    const helpdesk = this.helpdeskRepository.create(createHelpdeskDto);
    return this.helpdeskRepository.save(helpdesk);
  }

  async findAll(): Promise<Helpdesk[]> {
    return this.helpdeskRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Helpdesk> {
    const helpdesk = await this.helpdeskRepository.findOne({ where: { id } });
    if (!helpdesk) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return helpdesk;
  }

  async update(id: string, updateHelpdeskDto: UpdateHelpdeskDto): Promise<Helpdesk> {
    const helpdesk = await this.findOne(id);
    this.helpdeskRepository.merge(helpdesk, updateHelpdeskDto);
    return this.helpdeskRepository.save(helpdesk);
  }

  async remove(id: string): Promise<void> {
    const helpdesk = await this.findOne(id);
    await this.helpdeskRepository.remove(helpdesk);
  }
}
