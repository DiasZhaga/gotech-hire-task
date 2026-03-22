import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { AuthService } from '../auth/auth.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { JoinRoomDto } from '../dto/join-room.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly roomPrefix = 'room_';

  constructor(
    private messagesService: MessagesService,
    private authService: AuthService,
  ) {}

  handleConnection(client: Socket) {
    const tokenFromAuth = client.handshake.auth?.token as string | undefined;
    const headerAuth = client.handshake.headers?.authorization;
    const tokenFromHeader = Array.isArray(headerAuth) ? headerAuth[0] : headerAuth;
    const raw = tokenFromAuth || tokenFromHeader?.replace('Bearer ', '');
    if (!raw) {
      client.disconnect();
      return;
    }
    const decoded = this.authService.verifyToken(raw);
    if (!decoded) {
      client.disconnect();
      return;
    }
    client.data.user = { id: decoded.userId, username: decoded.username };
  }

  handleDisconnect(client: Socket) {
    client.data.user = undefined;
  }

  @SubscribeMessage('joinRoom')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  handleJoinRoom(@MessageBody() data: JoinRoomDto, @ConnectedSocket() client: Socket) {
    const roomKey = `${this.roomPrefix}${data.roomId}`;
    client.join(roomKey);
  }

  @SubscribeMessage('sendMessage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleMessage(@MessageBody() data: SendMessageDto, @ConnectedSocket() client: Socket) {
    const user = client.data.user as { id: number; username: string } | undefined;
    if (!user) {
      client.disconnect();
      return;
    }

    const message = await this.messagesService.saveMessage(data.roomId, user.id, data.content, user.username);

    const roomKey = `${this.roomPrefix}${data.roomId}`;
    this.server.to(roomKey).emit('newMessage', {
      ...message,
      username: user.username,
    });
  }

  @SubscribeMessage('leaveRoom')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  handleLeaveRoom(@MessageBody() data: JoinRoomDto, @ConnectedSocket() client: Socket) {
    const roomKey = `${this.roomPrefix}${data.roomId}`;
    client.leave(roomKey);
  }
}
