import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './app/worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  const logger = new Logger('Worker');
  logger.log('Realty79 Worker started');

  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
