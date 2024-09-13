import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sitter } from './sitter.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('recommends')
export class Recommend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  sitterId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Sitter, (sitter) => sitter.recommends, {
    onDelete: 'CASCADE',
  })
  sitter: Sitter;

  @ManyToOne(() => User, (user) => user.recommend, { onDelete: 'CASCADE' })
  user: User;
}
