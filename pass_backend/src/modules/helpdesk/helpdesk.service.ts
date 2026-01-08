import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Raw, Between, MoreThanOrEqual } from 'typeorm';
import { HelpdeskStatisticsDto } from './dto/statistics.dto';
import { Helpdesk } from './helpdesk.entity';
import { User } from '../users/user.entity';
import { CreateHelpdeskDto, UpdateHelpdeskDto } from './dto/helpdesk.dto';
import { HelpdeskStatus, UserRole, HelpdeskHistoryType } from '../../common/enums';
import { MinioService } from '../minio/minio.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { HelpdeskHistory } from './history.entity';
import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class HelpdeskService {
  constructor(
    @InjectRepository(Helpdesk)
    private helpdeskRepository: Repository<Helpdesk>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(HelpdeskHistory)
    private historyRepository: Repository<HelpdeskHistory>,
    private minioService: MinioService,
    private notificationsGateway: NotificationsGateway,
  ) { }

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

    const savedTicket = await this.helpdeskRepository.save(helpdesk);

    // 7. Record History
    await this.recordHistory({
      helpdeskId: savedTicket.id,
      type: HelpdeskHistoryType.CREATION,
      title: "Chamado Criado",
      description: `Ticket ${savedTicket.ticketNumber} aberto pelo cliente.`,
      userId: savedTicket.clientId,
      userName: client.name,
    });

    // 8. Notify Admins and Developers
    this.notificationsGateway.emitToSupport('ticket:created', savedTicket);

    return savedTicket;
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
    const oldStatus = helpdesk.status;
    const oldPriority = helpdesk.priority;
    const oldAssigneeId = helpdesk.assignedUserId;
    const oldTitle = helpdesk.title;
    const oldDescription = helpdesk.description;
    const oldCategory = helpdesk.category;
    const oldModule = helpdesk.module;
    const oldEnvironment = helpdesk.environment;

    // Validate assignedUserId
    let newAssignee = null;
    if (updateHelpdeskDto.assignedUserId) {
      newAssignee = await this.userRepository.findOne({ where: { id: updateHelpdeskDto.assignedUserId } });
      if (!newAssignee || newAssignee.role !== UserRole.DEVELOPER) {
        throw new BadRequestException('Assigned user must be a developer.');
      }
    }

    if (updateHelpdeskDto.status === HelpdeskStatus.ENCERRADO) {
      helpdesk.closedAt = new Date();
    }

    this.helpdeskRepository.merge(helpdesk, updateHelpdeskDto);
    const updatedTicket = await this.helpdeskRepository.save(helpdesk);

    // --- Record History for Changes ---

    // 1. Status Change
    if (updateHelpdeskDto.status && updateHelpdeskDto.status !== oldStatus) {
      await this.recordHistory({
        helpdeskId: updatedTicket.id,
        type: HelpdeskHistoryType.STATUS_CHANGE,
        title: "Status Alterado",
        description: `O status foi alterado para ${updatedTicket.status}.`,
        oldValue: oldStatus,
        newValue: updatedTicket.status,
      });
    }

    // 2. Priority Change
    if (updateHelpdeskDto.priority && updateHelpdeskDto.priority !== oldPriority) {
      await this.recordHistory({
        helpdeskId: updatedTicket.id,
        type: HelpdeskHistoryType.PRIORITY_CHANGE,
        title: "Prioridade Alterada",
        description: `A prioridade foi definida como ${updatedTicket.priority}.`,
        oldValue: oldPriority,
        newValue: updatedTicket.priority,
      });
    }

    // 3. Assignment Change
    if (updateHelpdeskDto.assignedUserId && updateHelpdeskDto.assignedUserId !== oldAssigneeId) {
      const assigneeName = (await this.userRepository.findOne({ where: { id: updateHelpdeskDto.assignedUserId } }))?.name || "Desenvolvedor";
      await this.recordHistory({
        helpdeskId: updatedTicket.id,
        type: HelpdeskHistoryType.ASSIGNMENT,
        title: "Responsável Atribuído",
        description: `Chamado atribuído a ${assigneeName}.`,
        newValue: assigneeName,
        userId: updatedTicket.assignedUserId,
        userName: assigneeName,
      });
    }

    // 4. Title Change
    if (updateHelpdeskDto.title && updateHelpdeskDto.title !== oldTitle) {
      await this.recordHistory({
        helpdeskId: updatedTicket.id,
        type: HelpdeskHistoryType.UPDATE,
        title: "Título Alterado",
        description: `Título alterado para: ${updatedTicket.title}`,
        oldValue: oldTitle,
        newValue: updatedTicket.title,
      });
    }

    // 5. Description Change
    if (updateHelpdeskDto.description && updateHelpdeskDto.description !== oldDescription) {
      await this.recordHistory({
        helpdeskId: updatedTicket.id,
        type: HelpdeskHistoryType.UPDATE,
        title: "Descrição Alterada",
        description: "A descrição do chamado foi atualizada.",
      });
    }

    // 6. Category Change
    if (updateHelpdeskDto.category && updateHelpdeskDto.category !== oldCategory) {
      await this.recordHistory({
        helpdeskId: updatedTicket.id,
        type: HelpdeskHistoryType.UPDATE,
        title: "Categoria Alterada",
        description: `Categoria alterada de ${oldCategory} para ${updatedTicket.category}.`,
        oldValue: oldCategory,
        newValue: updatedTicket.category,
      });
    }

    // 7. Module Change
    if (updateHelpdeskDto.module && updateHelpdeskDto.module !== oldModule) {
      await this.recordHistory({
        helpdeskId: updatedTicket.id,
        type: HelpdeskHistoryType.UPDATE,
        title: "Módulo Alterado",
        description: `Módulo alterado de ${oldModule} para ${updatedTicket.module}.`,
        oldValue: oldModule,
        newValue: updatedTicket.module,
      });
    }

    // 8. Environment Change
    if (updateHelpdeskDto.environment && updateHelpdeskDto.environment !== oldEnvironment) {
      await this.recordHistory({
        helpdeskId: updatedTicket.id,
        type: HelpdeskHistoryType.UPDATE,
        title: "Ambiente Alterado",
        description: `Ambiente alterado de ${oldEnvironment} para ${updatedTicket.environment}.`,
        oldValue: oldEnvironment,
        newValue: updatedTicket.environment,
      });
    }

    // Notify client about status/priority/assignment changes
    this.notificationsGateway.emitToUser(updatedTicket.clientId, 'ticket:updated', updatedTicket);

    return updatedTicket;
  }

  async remove(id: string): Promise<void> {
    const helpdesk = await this.findOne(id);
    await this.helpdeskRepository.remove(helpdesk);
  }

  // --- Message Handling ---

  async createMessage(helpdeskId: string, createMessageDto: any) {
    const helpdesk = await this.findOne(helpdeskId);

    // Validate author
    const author = await this.userRepository.findOne({ where: { id: createMessageDto.authorId } });
    if (!author) throw new NotFoundException('Author not found');

    // Validate author role matches authorType
    // Note: User can be CLIENT (user) or ADMIN/DEVELOPER (support)
    if (createMessageDto.authorType === 'user' && author.role !== UserRole.CLIENT) {
      throw new BadRequestException('Author type mismatch: expected CLIENT role for user type');
    }
    if (createMessageDto.authorType === 'support' && author.role === UserRole.CLIENT) {
      throw new BadRequestException('Author type mismatch: support type cannot be a CLIENT');
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}_${createMessageDto.authorType}_${createMessageDto.authorId}.json`;
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';

    const completeMessage = {
      AuthorId: createMessageDto.authorId,
      AuthorType: createMessageDto.authorType,
      Message: createMessageDto.message,
      CreatedAt: now.toISOString(),
      Attachments: createMessageDto.attachments || [],
    };

    try {
      await this.minioService.client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: `${helpdesk.bucketPath}/messages/${fileName}`,
        Body: JSON.stringify(completeMessage),
        ContentType: 'application/json',
      }));

      await this.helpdeskRepository.update(helpdeskId, { lastMessageAt: now });

      // Notify the other party
      const notificationData = {
        helpdeskId,
        message: completeMessage,
        ticketNumber: helpdesk.ticketNumber,
        authorName: author.name,
      };

      if (createMessageDto.authorType === 'user') {
        this.notificationsGateway.emitToSupport('message:new', notificationData);
      } else {
        this.notificationsGateway.emitToUser(helpdesk.clientId, 'message:new', notificationData);
      }

      // Record History
      await this.recordHistory({
        helpdeskId,
        type: HelpdeskHistoryType.MESSAGE,
        title: "Nova Mensagem",
        description: `Enviada por ${author.name}.`,
        userId: author.id,
        userName: author.name,
      });

      return { message: 'Message sent successfully', fileName, data: completeMessage };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to save message: ${error.message}`);
    }
  }

  async findAllMessages(helpdeskId: string) {
    const helpdesk = await this.findOne(helpdeskId);
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';

    const prefix = `${helpdesk.bucketPath}/messages/`.replace(/^\/+/, '');

    let contents = [];
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      });
      const response = await this.minioService.client.send(listCommand);
      if (response.Contents) {
        contents = response.Contents;
      }
    } catch (error) {
      console.error('Error listing messages from MinIO:', error.message);
      return [];
    }

    if (contents.length === 0) return [];

    try {
      const messages = await Promise.all(
        contents
          .filter(obj => obj.Key.endsWith('.json'))
          .sort((a, b) => a.Key!.localeCompare(b.Key!))
          .map(async (obj) => {
            try {
              const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: obj.Key });
              const objResponse = await this.minioService.client.send(getCommand);
              const body = await objResponse.Body?.transformToString();
              return body ? JSON.parse(body) : null;
            } catch (e) {
              console.error(`Error reading message file ${obj.Key}:`, e.message);
              return null;
            }
          })
      );

      return messages.filter(m => m !== null);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to retrieve messages: ${error.message}`);
    }
  }

  async deleteMessage(helpdeskId: string, messageIndex: number) {
    const helpdesk = await this.findOne(helpdeskId);
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';
    const prefix = `${helpdesk.bucketPath}/messages/`;

    try {
      // List all messages
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      });
      const response = await this.minioService.client.send(listCommand);

      if (!response.Contents || response.Contents.length === 0) {
        throw new NotFoundException('No messages found');
      }

      // Sort and get the message at the specified index
      const sortedMessages = response.Contents
        .filter(obj => obj.Key.endsWith('.json'))
        .sort((a, b) => a.Key!.localeCompare(b.Key!));

      if (messageIndex < 0 || messageIndex >= sortedMessages.length) {
        throw new NotFoundException('Message not found');
      }

      const messageToDelete = sortedMessages[messageIndex];

      // Delete the message file
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      await this.minioService.client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: messageToDelete.Key,
      }));

      return { message: 'Message deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete message: ${error.message}`);
    }
  }

  // --- Attachment Handling ---

  async uploadAttachment(
    helpdeskId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string; path: string }> {
    const helpdesk = await this.findOne(helpdeskId);
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedOriginalName}`;
    const filePath = `${helpdesk.bucketPath}/attachments/${filename}`;

    try {
      await this.minioService.client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filePath,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        }),
      );

      // Generate presigned URL for download (valid for 7 days)
      const url = await this.minioService.getPresignedUrl(bucketName, filePath, 7 * 24 * 60 * 60);

      // Record History
      await this.recordHistory({
        helpdeskId,
        type: HelpdeskHistoryType.ATTACHMENT,
        title: "Novo Anexo",
        description: `Arquivo "${file.originalname}" enviado.`,
        newValue: filename,
      });

      return {
        url,
        filename,
        path: `attachments/${filename}`,
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to upload attachment: ${error.message}`);
    }
  }

  async getAttachment(helpdeskId: string, filename: string): Promise<{ stream: any; contentType: string; originalName: string }> {
    const helpdesk = await this.findOne(helpdeskId);
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';
    const filePath = `${helpdesk.bucketPath}/attachments/${filename}`;

    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      });

      const response = await this.minioService.client.send(command);

      return {
        stream: response.Body,
        contentType: response.ContentType || 'application/octet-stream',
        originalName: response.Metadata?.originalName || filename,
      };
    } catch (error) {
      throw new NotFoundException(`Attachment not found: ${error.message}`);
    }
  }

  async listAttachments(helpdeskId: string): Promise<Array<{ filename: string; size: number; uploadedAt: string; url: string }>> {
    const helpdesk = await this.findOne(helpdeskId);
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';
    const prefix = `${helpdesk.bucketPath}/attachments/`;

    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      });

      const response = await this.minioService.client.send(listCommand);

      if (!response.Contents || response.Contents.length === 0) {
        return [];
      }

      const attachments = await Promise.all(
        response.Contents.map(async (obj) => {
          const filename = obj.Key!.split('/').pop()!;
          const url = await this.minioService.getPresignedUrl(bucketName, obj.Key!, 7 * 24 * 60 * 60);

          return {
            filename,
            size: obj.Size || 0,
            uploadedAt: obj.LastModified?.toISOString() || new Date().toISOString(),
            url,
          };
        })
      );

      return attachments.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    } catch (error) {
      console.error('Error listing attachments from MinIO:', error.message);
      return [];
    }
  }

  // --- History Handling ---

  async findAllHistory(helpdeskId: string): Promise<HelpdeskHistory[]> {
    return this.historyRepository.find({
      where: { helpdeskId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  private async recordHistory(params: {
    helpdeskId: string;
    type: HelpdeskHistoryType;
    title: string;
    description?: string;
    oldValue?: string;
    newValue?: string;
    userId?: string;
    userName?: string;
  }): Promise<void> {
    try {
      // 1. Save to Database
      const history = this.historyRepository.create(params);
      const savedHistory = await this.historyRepository.save(history);

      // 2. Save to MinIO Bucket
      const helpdesk = await this.helpdeskRepository.findOne({ where: { id: params.helpdeskId } });
      if (helpdesk) {
        const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const fileName = `${timestamp}_${params.type}.json`;

        const historyJson = {
          ...params,
          id: savedHistory.id,
          createdAt: now.toISOString(),
        };

        await this.minioService.client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: `${helpdesk.bucketPath}/history/${fileName}`,
          Body: JSON.stringify(historyJson),
          ContentType: 'application/json',
        }));
      }
    } catch (error) {
      // Don't throw - history recording should not break main flow
      console.error(`[HISTORY ERROR] Failed to record history: ${error.message}`);
    }
  }

  // --- Statistics ---

  async getStatistics(requestingUserId?: string, role?: string): Promise<HelpdeskStatisticsDto> {
    const userRole = role || 'CLIENT';

    // Build base query based on role
    let whereCondition: any = {};

    if (userRole === 'CLIENT' && requestingUserId) {
      // Client sees only their own tickets
      whereCondition.clientId = requestingUserId;
    } else if (userRole === 'DEVELOPER' && requestingUserId) {
      // Developer sees only assigned tickets
      whereCondition.assignedUserId = requestingUserId;
    }
    // ADMIN sees all tickets (no filter)

    // Get all tickets matching the role filter
    const tickets = await this.helpdeskRepository.find({ where: whereCondition });

    // Calculate tickets by status
    const ticketsByStatus: Record<string, number> = {
      ABERTO: 0,
      EM_ANALISE: 0,
      EM_ANDAMENTO: 0,
      AGUARDANDO_USUARIO: 0,
      RESOLVIDO: 0,
      ENCERRADO: 0,
    };

    // Calculate tickets by priority
    const ticketsByPriority: Record<string, number> = {
      BAIXA: 0,
      MEDIA: 0,
      ALTA: 0,
      CRITICA: 0,
    };

    // Calculate tickets by module
    const ticketsByModule: Record<string, number> = {
      AGENDAMENTO: 0,
      TREINAMENTOS: 0,
      FINANCEIRO: 0,
      USUARIOS: 0,
    };

    // Aggregate counts
    for (const ticket of tickets) {
      if (ticket.status && ticketsByStatus[ticket.status] !== undefined) {
        ticketsByStatus[ticket.status]++;
      }
      if (ticket.priority && ticketsByPriority[ticket.priority] !== undefined) {
        ticketsByPriority[ticket.priority]++;
      }
      if (ticket.module && ticketsByModule[ticket.module] !== undefined) {
        ticketsByModule[ticket.module]++;
      }
    }

    // Calculate monthly trends (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const ticketsTrend: Array<{ month: string; count: number; opened: number; closed: number }> = [];

    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - 5 + i + 1, 0, 23, 59, 59);

      const monthName = monthStart.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });

      const openedThisMonth = tickets.filter(t => {
        const created = new Date(t.createdAt);
        return created >= monthStart && created <= monthEnd;
      }).length;

      const closedThisMonth = tickets.filter(t => {
        if (!t.closedAt) return false;
        const closed = new Date(t.closedAt);
        return closed >= monthStart && closed <= monthEnd;
      }).length;

      ticketsTrend.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        count: openedThisMonth,
        opened: openedThisMonth,
        closed: closedThisMonth,
      });
    }

    // Calculate message statistics from MinIO
    let totalMessages = 0;
    let totalAttachments = 0;
    const bucketName = process.env.MINIO_BUCKET_HELPDESK || 'helpdesk';

    for (const ticket of tickets) {
      if (!ticket.bucketPath) continue;

      try {
        // Count messages
        const messagesPrefix = `${ticket.bucketPath}/messages/`;
        const messagesResponse = await this.minioService.client.send(new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: messagesPrefix,
        }));
        totalMessages += (messagesResponse.Contents || []).filter(obj => obj.Key?.endsWith('.json')).length;

        // Count attachments
        const attachmentsPrefix = `${ticket.bucketPath}/attachments/`;
        const attachmentsResponse = await this.minioService.client.send(new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: attachmentsPrefix,
        }));
        totalAttachments += (attachmentsResponse.Contents || []).length;
      } catch (error) {
        // Ignore individual MinIO errors
        console.warn(`[STATS] Failed to count messages for ticket ${ticket.id}:`, error.message);
      }
    }

    const avgMessagesPerTicket = tickets.length > 0 ? Math.round((totalMessages / tickets.length) * 10) / 10 : 0;

    // Calculate totals
    const totals = {
      total: tickets.length,
      open: ticketsByStatus.ABERTO + ticketsByStatus.EM_ANALISE + ticketsByStatus.AGUARDANDO_USUARIO,
      inProgress: ticketsByStatus.EM_ANDAMENTO,
      resolved: ticketsByStatus.RESOLVIDO,
      closed: ticketsByStatus.ENCERRADO,
    };

    // Calculate month-over-month percentage change
    const currentMonthTickets = ticketsTrend[5]?.opened || 0;
    const previousMonthTickets = ticketsTrend[4]?.opened || 0;
    const ticketPercentChange = previousMonthTickets > 0
      ? Math.round(((currentMonthTickets - previousMonthTickets) / previousMonthTickets) * 100 * 10) / 10
      : 0;

    return {
      ticketsByStatus,
      ticketsByPriority,
      ticketsByModule,
      ticketsTrend,
      messagesStats: {
        totalMessages,
        totalAttachments,
        avgMessagesPerTicket,
      },
      totals,
      percentageChange: {
        tickets: ticketPercentChange,
        messages: 0, // Would need historical message data
      },
      role: userRole,
      userId: requestingUserId,
    };
  }
}
