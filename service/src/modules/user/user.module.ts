import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { AuthController, UserController, AdminUserController } from './user.controller';
import { AuthTokenService } from '../auth/auth-token.service';
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
  controllers: [AuthController, UserController, AdminUserController],
  providers: [UserService, AuthTokenService],
  exports: [UserService, AuthTokenService],
})
export class UserModule {}
