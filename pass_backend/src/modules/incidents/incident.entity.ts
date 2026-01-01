import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SeverityLevel } from '../../common/enums';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.incidents)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ nullable: true })
  title: string;

  @Column()
  classification: string;

  @Column({ type: 'enum', enum: SeverityLevel })
  severity: SeverityLevel;

  @Column()
  date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'attachment_url', nullable: true })
  attachmentUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
