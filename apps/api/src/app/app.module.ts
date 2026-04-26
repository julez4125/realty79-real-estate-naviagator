import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { commonRedactPaths } from '@org/shared';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CorrelationIdModule } from '../common/observability/correlation-id.module';
import { TenantModule } from '../common/tenant/tenant.module';
import { HealthModule } from '../modules/health/health.module';
import { PropertyModule } from '../modules/property/property.module';
import { AnalysisModule } from '../modules/analysis/analysis.module';
import { PipelineModule } from '../modules/pipeline/pipeline.module';
import { PipelineConfigModule } from '../modules/config/config.module';
import { ScraperModule } from '../modules/scraper/scraper.module';
import { AgentModule } from '../modules/agent/agent.module';
import { ResearchModule } from '../modules/research/research.module';
import { VisionModule } from '../modules/vision/vision.module';
import { PortfolioModule } from '../modules/portfolio/portfolio.module';
import { UnitModule } from '../modules/unit/unit.module';
import { LeaseModule } from '../modules/lease/lease.module';
import { RenterModule } from '../modules/renter/renter.module';
import { PaymentModule } from '../modules/payment/payment.module';
import { DocumentModule } from '../modules/document/document.module';
import { ContractModule } from '../modules/contract/contract.module';
import { MessagingModule } from '../modules/messaging/messaging.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { MaintenanceModule } from '../modules/maintenance/maintenance.module';
import { AccountingModule } from '../modules/accounting/accounting.module';
import { AuthModule } from '../modules/auth/auth.module';
import { BillingModule } from '../modules/billing/billing.module';
import { getCorrelationId } from '../common/observability/correlation-id.middleware';
import { getCurrentTenantId } from '../common/tenant/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (_req, _res) => ({
          correlationId: getCorrelationId(),
          tenantId: getCurrentTenantId(),
        }),
        redact: commonRedactPaths,
        autoLogging: true,
        quietReqLogger: false,
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6380'),
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    CorrelationIdModule,
    TenantModule,
    HealthModule,
    PropertyModule,
    AnalysisModule,
    PipelineModule,
    PipelineConfigModule,
    ScraperModule,
    AgentModule,
    ResearchModule,
    VisionModule,
    PortfolioModule,
    UnitModule,
    LeaseModule,
    RenterModule,
    PaymentModule,
    DocumentModule,
    ContractModule,
    MessagingModule,
    NotificationModule,
    MaintenanceModule,
    AccountingModule,
    AuthModule,
    BillingModule,
  ],
})
export class AppModule {}
