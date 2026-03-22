import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('me')
  async getMe(@Headers('authorization') auth: string | undefined) {
    if (!auth) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.replace('Bearer ', '');
    const decoded = this.authService.verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }
    return this.usersService.getPublicById(decoded.userId);
  }
}
