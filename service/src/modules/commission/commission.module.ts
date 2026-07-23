import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommissionController } from './commission.controller';
import { AdminCommissionController } from './admin-commission.controller';
import { CommissionService } from './commission.service';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
  imports: [
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
  controllers: [CommissionController, AdminCommissionController],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
