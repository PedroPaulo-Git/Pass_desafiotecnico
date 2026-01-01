import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Raw } from 'typeorm';
import { Helpdesk } from './helpdesk.entity';
import { User } from '../users/user.entity';
import { CreateHelpdeskDto, UpdateHelpdeskDto } from './dto/helpdesk.dto';
import { HelpdeskStatus, UserRole } from '../../common/enums';
import { MinioService } from '../minio/minio.service';
import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class HelpdeskService {
  constructor(
    @InjectRepository(Helpdesk)
    private helpdeskRepository: Repository<Helpdesk>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private minioService: MinioService,
  ) {}

  async create(createHelpdeskDto: CreateHelpdeskDto): Promise<Helpdesk> {
    // 1. Validate client exists
    const client = await this.userRepository.findOne({ where: { id: createHelpdeskDto.clientId } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${createHelpdeskDto.clientId} not found`);
    }

    // 2. Validate userId if provided
    if (createHelpdeskDto.userId) {
      const user = await this.userRepository.findOne({ where: { id: createHelpdeskDto.userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${createHelpdeskDto.userId} not found`);
      }
    }

    // 3. Enforce unresolved tickets rule (only for non-ADMIN)
    if (client.role !== UserRole.ADMIN) {
      const existing = await this.helpdeskRepository.findOne({
        where: {
          clientId: createHelpdeskDto.clientId,
          status: Raw(alias => `${alias} NOT IN ('RESOLVIDO', 'ENCERRADO')`),
        },
      });

      if (existing) {
        throw new ConflictException(`You already have an unresolved ticket (${existing.ticketNumber}).`);
      }
    }

    // 4. Generate ticket number
    const currentYear = new Date().getFullYear();
    const lastTicket = await this.helpdeskRepository.findOne({
      where: { ticketNumber: Like(`TKT-${currentYear}-%`) },
      order: { ticketNumber: 'DESC' },
    });

    let ticketSequence = 1;
    if (lastTicket?.ticketNumber) {
      const parts = lastTicket.ticketNumber.split('-');
      if (parts.length === 3) {
        ticketSequence = parseInt(parts[2], 10) + 1;
      }
    }

    const ticketNumber = `TKT-${currentYear}-${ticketSequence.toString().padStart(3, '0')}`;
    const ticketId = randomUUID();
    const bucketPath = `helpdesk/client_${createHelpdeskDto.clientId}/ticket_${ticketId}`;
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';

    // 5. Sync ticket.json with MinIO
    const ticketJson = {
      id: ticketId,
      ticketNumber,
      ...createHelpdeskDto,
      createdAt: new Date().toISOString(),
    };

    try {
      await this.minioService.client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: `${bucketPath}/ticket.json`,
          Body: JSON.stringify(ticketJson),
          ContentType: 'application/json',
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(`Failed to sync ticket to storage: ${error.message}`);
    }

    // 6. Save to DB
    const helpdesk = this.helpdeskRepository.create({
      ...createHelpdeskDto,
      id: ticketId,
      ticketNumber,
      bucketPath,
      lastMessageAt: new Date(),
    });

    return this.helpdeskRepository.save(helpdesk);
  }

  async findAll(query: any): Promise<{ data: Helpdesk[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search, ...filters } = query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const queryBuilder = this.helpdeskRepository.createQueryBuilder('helpdesk');

    // Dynamic filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder') {
        queryBuilder.andWhere(`helpdesk.${key} = :${key}`, { [key]: filters[key] });
      }
    });

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(helpdesk.title ILIKE :search OR helpdesk.description ILIKE :search OR helpdesk.ticketNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`helpdesk.${sortBy}`, sortOrder.toUpperCase())
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    const [data, total] = await queryBuilder.getManyAndCount();
    
    return { 
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    };
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

    // Validate assignedUserId
    if (updateHelpdeskDto.assignedUserId) {
      const assignee = await this.userRepository.findOne({ where: { id: updateHelpdeskDto.assignedUserId } });
      if (!assignee || assignee.role !== UserRole.DEVELOPER) {
        throw new BadRequestException('Assigned user must be a developer.');
      }
    }

    if (updateHelpdeskDto.status === HelpdeskStatus.ENCERRADO) {
      helpdesk.closedAt = new Date();
    }

    this.helpdeskRepository.merge(helpdesk, updateHelpdeskDto);
    return this.helpdeskRepository.save(helpdesk);
  }

  async remove(id: string): Promise<void> {
    const helpdesk = await this.findOne(id);

    if (helpdesk.status !== HelpdeskStatus.ENCERRADO) {
      throw new BadRequestException('Cannot delete an open ticket.');
    }

    await this.helpdeskRepository.remove(helpdesk);
  }

  // --- Message Handling ---

  async createMessage(helpdeskId: string, messageData: any) {
    const helpdesk = await this.findOne(helpdeskId);
    
    // Validate author
    const author = await this.userRepository.findOne({ where: { id: messageData.authorId } });
    if (!author) throw new NotFoundException('Author not found');

    // Validate author role matches authorType
    if (messageData.authorType === 'user' && author.role !== UserRole.CLIENT) {
      throw new BadRequestException('Author type mismatch: expected CLIENT role');
    }
    if (messageData.authorType === 'support' && author.role !== UserRole.DEVELOPER) {
      throw new BadRequestException('Author type mismatch: expected DEVELOPER role');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}_${messageData.authorType}_${messageData.authorId}.json`;
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';

    const completeMessage = {
      ...messageData,
      createdAt: new Date().toISOString(),
    };

    try {
      await this.minioService.client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: `${helpdesk.bucketPath}/messages/${fileName}`,
        Body: JSON.stringify(completeMessage),
        ContentType: 'application/json',
      }));

      await this.helpdeskRepository.update(helpdeskId, { lastMessageAt: new Date() });
      return { message: 'Message sent successfully', fileName };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to save message: ${error.message}`);
    }
  }

  async findAllMessages(helpdeskId: string) {
    const helpdesk = await this.findOne(helpdeskId);
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';
    
    // Try different prefix formats for backward compatibility (legacy logic)
    const prefixes = [
      `${helpdesk.bucketPath}/messages/`,
      `${helpdesk.bucketPath.replace(/^\/+/, '')}/messages/`,
    ];

    let contents = [];
    for (const prefix of prefixes) {
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
        });
        const response = await this.minioService.client.send(listCommand);
        if (response.Contents && response.Contents.length > 0) {
          contents = response.Contents;
          break;
        }
      } catch (error) {
        // Continue to next prefix
      }
    }

    if (contents.length === 0) return [];

    try {
      const messages = await Promise.all(
        contents
          .sort((a, b) => a.Key!.localeCompare(b.Key!))
          .map(async (obj) => {
            const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: obj.Key });
            const objResponse = await this.minioService.client.send(getCommand);
            const body = await objResponse.Body?.transformToString();
            return body ? JSON.parse(body) : null;
          })
      );

      return messages.filter(m => m !== null);
    } catch (error) {
       throw new InternalServerErrorException(`Failed to retrieve messages: ${error.message}`);
    }
  }
}
