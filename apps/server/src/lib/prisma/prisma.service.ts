import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { prisma } from './db';

/**
 * Nest wrapper around the shared Prisma client used by Better Auth.
 * Inject this in feature modules; use `this.prisma.db.<model>`.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db = prisma;

  async onModuleInit(): Promise<void> {
    await this.db.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.$disconnect();
  }
}
