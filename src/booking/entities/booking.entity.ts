import { Sitter } from 'src/sitter/entities/sitter.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  sitterId: number;

  @Column()
  bookingStartTime: Date;

  @Column()
  bookingEndTime: Date;

  @Column()
  serviceHour: number;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.booking)
  user: User;

  @ManyToOne(() => Sitter, (sitter) => sitter.booking)
  sitter: Sitter;
}
