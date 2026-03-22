import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    const { username, password } = body;
    return this.authService.register(username, password);
  }

  @Post('login')
  async login(@Body() body: CreateUserDto) {
    const { username, password } = body;
    return this.authService.login(username, password);
  }
}
