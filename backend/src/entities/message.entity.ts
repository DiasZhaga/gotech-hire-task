import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_messages_room_id')
  @Column({ name: 'room_id' })
  roomId: number;

  @Index('idx_messages_user_id')
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  senderName: string;

  @CreateDateColumn()
  createdAt: Date;
}
