import { Controller, Get, Post, Body, Param, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { MessagesService } from './messages.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { AuthService } from '../auth/auth.service';

@Controller('chat')
export class ChatController {
  constructor(
    private roomsService: RoomsService,
    private messagesService: MessagesService,
    private authService: AuthService,
  ) {}

  // No @UseGuards(JwtAuthGuard) - all routes unprotected
  @Get('rooms')
  async getRooms() {
    return this.roomsService.getRooms();
  }

  @Post('rooms')
  async createRoom(@Body() body: CreateRoomDto, @Headers('authorization') auth: string | undefined) {
    if (!auth) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.replace('Bearer ', '');
    const decoded = this.authService.verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.roomsService.createRoom(body.name, body.description);
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);
    return this.messagesService.getMessages(parseInt(roomId, 10), safeLimit, safeOffset);
  }
}
