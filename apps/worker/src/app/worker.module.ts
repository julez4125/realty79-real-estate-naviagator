import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../../api/src/common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6380'),
      },
    }),
    PrismaModule,
  ],
})
export class WorkerModule {}
