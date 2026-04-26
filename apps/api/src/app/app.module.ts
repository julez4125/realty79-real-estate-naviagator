import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../common/prisma/prisma.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6380'),
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    HealthModule,
    PropertyModule,
    AnalysisModule,
    PipelineModule,
    PipelineConfigModule,
    ScraperModule,
    AgentModule,
    ResearchModule,
    VisionModule,
    // Sprint 5: Verwaltung
    PortfolioModule,
    UnitModule,
    LeaseModule,
    RenterModule,
    PaymentModule,
    DocumentModule,
    // Sprint 6: AI Assist
    ContractModule,
    MessagingModule,
    NotificationModule,
    // Sprint 8: Advanced Verwaltung
    MaintenanceModule,
    AccountingModule,
    // Sprint 9: SaaS
    AuthModule,
    BillingModule,
  ],
})
export class AppModule {}
