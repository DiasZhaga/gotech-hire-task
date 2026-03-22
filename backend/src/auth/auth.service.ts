import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private assertJwtSecret() {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  private async verifyPassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  async register(username: string, password: string): Promise<{ token: string; userId: number }> {
    if (!username || username.length < 3) {
      throw new BadRequestException('Username too short');
    }
    if (!password || password.length < 8) {
      throw new BadRequestException('Password too short');
    }

    const existing = await this.userRepository.findOne({ where: { username } });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    const hashed = await this.hashPassword(password);
    const user = this.userRepository.create({ username, password: hashed });
    const saved = await this.userRepository.save(user);

    this.assertJwtSecret();
    const token = jwt.sign({ userId: saved.id, username }, JWT_SECRET as string, { expiresIn: '24h' });
    return { token, userId: saved.id };
  }

  async login(username: string, password: string): Promise<{ token: string; userId: number }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.assertJwtSecret();
    const token = jwt.sign({ userId: user.id, username }, JWT_SECRET as string, { expiresIn: '24h' });
    return { token, userId: user.id };
  }

  // async refreshToken(token: string) {
  //   // TODO: implement refresh tokens
  //   return null;
  // }

  verifyToken(token: string): { userId: number; username: string } | null {
    try {
      this.assertJwtSecret();
      return jwt.verify(token, JWT_SECRET as string) as { userId: number; username: string };
    } catch {
      return null;
    }
  }
}
