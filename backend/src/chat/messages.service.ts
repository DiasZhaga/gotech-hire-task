import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getMessages(
    roomId: number,
    limit: number,
    offset: number,
  ): Promise<Array<{ id: number; roomId: number; userId: number; content: string; senderName: string; createdAt: Date; username: string }>> {
    const messages = await this.messageRepository.find({
      where: { roomId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return messages.map((msg) => ({
      id: msg.id,
      roomId: msg.roomId,
      userId: msg.userId,
      content: msg.content,
      senderName: msg.senderName,
      createdAt: msg.createdAt,
      username: msg.user?.username ?? msg.senderName ?? 'unknown',
    }));
  }

  async saveMessage(roomId: number, userId: number, content: string, senderName: string): Promise<Message> {
    const message = this.messageRepository.create({
      roomId,
      userId,
      content,
      senderName,
    });
    return this.messageRepository.save(message);
  }

  async deleteMessage(messageId: number, userId: number): Promise<boolean> {
    const msg = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!msg) return false;
    if (msg.userId !== userId) return false;
    await this.messageRepository.delete(messageId);
    return true;
  }
}
