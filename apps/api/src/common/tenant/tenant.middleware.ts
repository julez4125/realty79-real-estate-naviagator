import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { Request, Response, NextFunction } from 'express';

const tenantAls = new AsyncLocalStorage<Map<string, string>>();

export function getCurrentTenantId(): string {
  return tenantAls.getStore()?.get('tenantId') ?? 'default';
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const user = (req as Request & { user?: { tenantId?: string } }).user;
    const tenantId = user?.tenantId ?? 'default';

    const store = new Map<string, string>();
    store.set('tenantId', tenantId);

    tenantAls.run(store, () => next());
  }
}
