import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    if (!process.env.DATABASE_URL || process.env.PRISMA_SKIP_CONNECT === 'true') {
      this.logger.warn(
        'Prisma connection is skipped (DATABASE_URL missing or PRISMA_SKIP_CONNECT=true). DB-backed flows will be unavailable.',
      );
      return;
    }
    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Prisma connection failed at startup: ${message}`);
      this.logger.warn(
        'Continuing without DB connection. Start PostgreSQL (or update DATABASE_URL) for DB-backed endpoints.',
      );
    }
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
