import { Booking } from 'src/booking/entities/booking.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Recommend } from './recommend-sitter.entity';

@Entity('sitters')
export class Sitter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column()
  profileUrl: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  recommendCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  booking: Booking[];

  @OneToMany(() => Recommend, (recommend) => recommend.sitter)
  recommends: Recommend[];
}
