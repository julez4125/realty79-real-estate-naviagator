// Sentry must be initialised before NestFactory.create — keep this import first.
import * as Sentry from '@sentry/node';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

if (process.env['SENTRY_DSN']) {
  Sentry.init({
    dsn: process.env['SENTRY_DSN'],
    tracesSampleRate: 0.1,
    environment: process.env['NODE_ENV'] ?? 'development',
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(PinoLogger));

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      process.env['CORS_ORIGIN'] ?? 'http://localhost:4200',
      'http://localhost:4200',
      'http://localhost:8100',
    ],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'x-correlation-id'],
    exposedHeaders: ['x-correlation-id'],
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Bull-board admin UI — placeholder auth: redirects to login if no session.
  // Full JWT guard wiring happens in M5.1.
  try {
    const { createBullBoard } = await import('@bull-board/api');
    const { ExpressAdapter } = await import('@bull-board/express');
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/api/admin/queues');
    createBullBoard({ queues: [], serverAdapter });

    app.use('/api/admin/queues', (req: any, res: any, next: any) => {
      if (!req.cookies?.['admin_session'] && !req.headers?.['x-admin-token']) {
        res.redirect('/api/auth/login');
        return;
      }
      next();
    });
    app.use('/api/admin/queues', serverAdapter.getRouter());
  } catch {
    Logger.warn('bull-board not available — skipping admin UI');
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Realty79 API')
    .setDescription('AI-Powered Immobilienverwaltung & Investment Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  Logger.log(`Realty79 API running on http://localhost:${port}/api`);
  Logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
