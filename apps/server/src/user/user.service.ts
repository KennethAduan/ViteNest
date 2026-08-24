import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { CreateUserDto } from '@vitenest/contracts';
import type { auth } from '../lib/better-auth/auth';
import { PrismaService } from '../lib/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService<typeof auth>,
  ) {}

  findAll() {
    return this.prisma.db.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const user = await this.prisma.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const { user } = await this.authService.api.createUser({
      body: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: dto.role ?? 'user',
      },
    });
    return user;
  }
}
