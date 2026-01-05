import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Helpdesk } from './helpdesk.entity';
import { User } from '../users/user.entity';
import { HelpdeskHistoryType } from '../../common/enums';

@Entity('helpdesk_history')
export class HelpdeskHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'helpdesk_id' })
  helpdeskId: string;

  @ManyToOne(() => Helpdesk, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'helpdesk_id' })
  helpdesk: Helpdesk;

  @Column({ type: 'enum', enum: HelpdeskHistoryType })
  type: HelpdeskHistoryType;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'old_value', nullable: true })
  oldValue: string;

  @Column({ name: 'new_value', nullable: true })
  newValue: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
