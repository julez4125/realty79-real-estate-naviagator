import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

const als = new AsyncLocalStorage<Map<string, string>>();

export function getCorrelationId(): string | undefined {
  return als.getStore()?.get('correlationId');
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();

    res.setHeader('x-correlation-id', correlationId);

    const store = new Map<string, string>();
    store.set('correlationId', correlationId);

    als.run(store, () => next());
  }
}
