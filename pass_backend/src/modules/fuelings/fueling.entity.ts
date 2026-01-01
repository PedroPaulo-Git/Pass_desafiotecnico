import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FuelType } from '../../common/enums';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity('fuelings')
export class Fueling {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.fuelings)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column()
  date: Date;

  @Column()
  provider: string;

  @Column({ type: 'enum', enum: FuelType, name: 'fuel_type' })
  fuelType: FuelType;

  @Column({ type: 'float' })
  liters: number;

  @Column({ type: 'float', name: 'total_value' })
  totalValue: number;

  @Column({ type: 'float', name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'int' })
  odometer: number;

  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
