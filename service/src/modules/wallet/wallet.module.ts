import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletService } from './wallet.service';
import { RechargeService } from './recharge.service';
import { WalletController } from './wallet.controller';
import { RechargeController } from './recharge.controller';
import { AdminWalletController } from './admin-wallet.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [WalletController, RechargeController, AdminWalletController],
  providers: [WalletService, RechargeService],
  exports: [WalletService, RechargeService],
})
export class WalletModule {}
