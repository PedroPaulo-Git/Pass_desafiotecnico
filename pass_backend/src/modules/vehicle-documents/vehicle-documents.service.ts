import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { VehicleDocument } from './vehicle-document.entity';
import { CreateVehicleDocumentDto, UpdateVehicleDocumentDto } from './dto/vehicle-document.dto';

@Injectable()
export class VehicleDocumentsService {
  constructor(
    @InjectRepository(VehicleDocument)
    private documentsRepository: Repository<VehicleDocument>,
  ) {}

  async create(createDto: CreateVehicleDocumentDto): Promise<VehicleDocument> {
    const doc = this.documentsRepository.create(createDto as unknown as DeepPartial<VehicleDocument>);
    return this.documentsRepository.save(doc);
  }

  async findAll(vehicleId?: string): Promise<VehicleDocument[]> {
    const where = vehicleId ? { vehicleId } : {};
    return this.documentsRepository.find({ where, order: { expiryDate: 'ASC' } });
  }

  async findOne(id: string): Promise<VehicleDocument> {
    const doc = await this.documentsRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return doc;
  }

  async update(id: string, updateDto: UpdateVehicleDocumentDto): Promise<VehicleDocument> {
    const doc = await this.findOne(id);
    this.documentsRepository.merge(doc, updateDto as any);
    return this.documentsRepository.save(doc);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findOne(id);
    await this.documentsRepository.remove(doc);
  }
}
