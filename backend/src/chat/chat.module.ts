import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../entities/room.entity';
import { Message } from '../entities/message.entity';
import { AuthModule } from '../auth/auth.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { RoomsService } from './rooms.service';
import { MessagesService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Message]), AuthModule],
  controllers: [ChatController],
  providers: [RoomsService, MessagesService, ChatGateway],
  exports: [RoomsService, MessagesService],
})
export class ChatModule {}
