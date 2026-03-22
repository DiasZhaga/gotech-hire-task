import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface PublicUser {
  id: number;
  username: string;
  role: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getPublicById(id: number): Promise<PublicUser> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'createdAt'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
