import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { UserService } from './user.service';
import { PrismaService } from '../lib/prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    db: {
      user: {
        findMany: jest.Mock;
        findUnique: jest.Mock;
      };
    };
  };
  let authService: { api: { createUser: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      db: {
        user: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
        },
      },
    };
    authService = { api: { createUser: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne throws NotFoundException when user is missing', async () => {
    prisma.db.user.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create delegates to the admin plugin createUser endpoint', async () => {
    const user = { id: '1', name: 'Ken', email: 'ken@example.com' };
    authService.api.createUser.mockResolvedValue({ user });

    const result = await service.create({
      name: 'Ken',
      email: 'ken@example.com',
      password: 'password123',
    });

    expect(authService.api.createUser).toHaveBeenCalledWith({
      body: {
        name: 'Ken',
        email: 'ken@example.com',
        password: 'password123',
        role: 'user',
      },
    });
    expect(result).toBe(user);
  });
});
