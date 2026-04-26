export const LOG_FIELDS = {
  correlationId: 'correlationId',
  tenantId: 'tenantId',
  userId: 'userId',
  durationMs: 'durationMs',
  sourceModule: 'sourceModule',
} as const;

export const commonRedactPaths: string[] = [
  '*.password',
  '*.passwordHash',
  '*.authorization',
  '*.headers.authorization',
];
