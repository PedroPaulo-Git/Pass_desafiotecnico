import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { HelpdeskCategory, HelpdeskPriority, HelpdeskStatus, HelpdeskModule, HelpdeskEnvironment } from '../../common/enums';

@Entity('helpdesk')
export class Helpdesk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_number', nullable: true, unique: true })
  ticketNumber: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'assigned_user_id', nullable: true })
  assignedUserId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: HelpdeskCategory })
  category: HelpdeskCategory;

  @Column({ type: 'enum', enum: HelpdeskPriority, default: HelpdeskPriority.BAIXA })
  priority: HelpdeskPriority;

  @Column({ type: 'enum', enum: HelpdeskStatus, default: HelpdeskStatus.ABERTO })
  status: HelpdeskStatus;

  @Column({ type: 'enum', enum: HelpdeskModule, nullable: true })
  module: HelpdeskModule;

  @Column({ type: 'enum', enum: HelpdeskEnvironment, default: HelpdeskEnvironment.WEB })
  environment: HelpdeskEnvironment;

  @Column({ name: 'bucket_path', nullable: true })
  bucketPath: string;

  @Column({ name: 'last_message_at', nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'closed_at', nullable: true })
  closedAt: Date;
}
