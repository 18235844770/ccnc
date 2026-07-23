import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { AdminPromotionController } from './admin-promotion.controller';
import { InviteProgressService } from './invite-progress.service';

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
  controllers: [PromotionController, AdminPromotionController],
  providers: [PromotionService, InviteProgressService],
  exports: [PromotionService, InviteProgressService],
})
export class PromotionModule {}
