import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { VehicleStatus, VehicleCategory, VehicleClassification, FuelType } from '../../common/enums';
import { Fueling } from '../fuelings/fueling.entity';
import { Incident } from '../incidents/incident.entity';
import { VehicleDocument } from '../vehicle-documents/vehicle-document.entity';
// import { VehicleImage } from '../vehicle-images/vehicle-image.entity'; // Will add later

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internal_id', nullable: true, unique: true })
  internalId: string;

  @Column({ unique: true })
  plate: string;

  @Column({ nullable: true, unique: true })
  renavam: string;

  @Column({ nullable: true, unique: true })
  chassis: string;

  @Column()
  model: string;

  @Column()
  brand: string;

  @Column()
  year: number;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'simple-enum', enum: VehicleCategory })
  category: VehicleCategory;

  @Column({ type: 'simple-enum', enum: VehicleClassification })
  classification: VehicleClassification;

  @Column()
  capacity: number;

  @Column({ default: 1 })
  doors: number;

  @Column({ type: 'simple-enum', enum: FuelType, name: 'fuel_type' })
  fuelType: FuelType;

  @Column({ nullable: true })
  state: string;

  @Column({ default: 0, name: 'current_km' })
  currentKm: number;

  @Column({ type: 'simple-enum', enum: VehicleStatus, default: VehicleStatus.LIBERADO })
  status: VehicleStatus;

  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Fueling, (fueling) => fueling.vehicle)
  fuelings: Fueling[];

  @OneToMany(() => Incident, (incident) => incident.vehicle)
  incidents: Incident[];

  @OneToMany(() => VehicleDocument, (document) => document.vehicle)
  documents: VehicleDocument[];

  // @OneToMany(() => VehicleImage, (image) => image.vehicle)
  // images: VehicleImage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
