import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getCorrelationId } from './correlation-id.middleware';
import { getCurrentTenantId } from '../tenant/tenant.middleware';

// Sentry is only loaded when SENTRY_DSN is set; imported lazily to avoid
// pulling in the full SDK when it is not configured.
let sentryCapture: ((err: unknown, extra: Record<string, unknown>) => void) | null = null;

if (process.env['SENTRY_DSN']) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/node') as typeof import('@sentry/node');
  sentryCapture = (err, extra) => {
    Sentry.withScope((scope) => {
      Object.entries(extra).forEach(([k, v]) => scope.setTag(k, String(v ?? '')));
      Sentry.captureException(err);
    });
  };
}

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      user?: { userId?: string; tenantId?: string };
    }>();

    return next.handle().pipe(
      catchError((err: unknown) => {
        if (sentryCapture) {
          sentryCapture(err, {
            correlationId: getCorrelationId() ?? '',
            tenantId: getCurrentTenantId(),
            userId: req.user?.userId ?? '',
          });
        }
        return throwError(() => err);
      }),
    );
  }
}
