import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderService } from './order.service';
import { OrderController, AdminOrderController } from './order.controller';
import { CommissionModule } from '../commission/commission.module';
import { QueueModule } from '../../queue/queue.module';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
  imports: [
    forwardRef(() => CommissionModule),
    QueueModule,
    PromotionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
