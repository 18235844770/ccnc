import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { ContentModule } from './modules/content/content.module';
import { AdminModule } from './modules/admin/admin.module';
import { OrderModule } from './modules/order/order.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CommissionModule } from './modules/commission/commission.module';
import { JobsModule } from './jobs/jobs.module';
import { QueueModule } from './queue/queue.module';
import { StatsModule } from './modules/stats/stats.module';
import { RiskModule } from './modules/risk/risk.module';
import { SystemModule } from './modules/system/system.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    HealthModule,
    UserModule,
    ProductModule,
    ContentModule,
    AdminModule,
    QueueModule,
    OrderModule,
    PromotionModule,
    WalletModule,
    CommissionModule,
    StatsModule,
    RiskModule,
    SystemModule,
    JobsModule,
  ],
})
export class AppModule {}
