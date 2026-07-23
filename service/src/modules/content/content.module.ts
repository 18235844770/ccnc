import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BannerService } from './banner.service';
import { ArticleService } from './article.service';
import { BannerController, AdminBannerController } from './banner.controller';
import { ArticleController, AdminArticleController } from './article.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ADMIN_SECRET') || config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [BannerController, AdminBannerController, ArticleController, AdminArticleController],
  providers: [BannerService, ArticleService],
})
export class ContentModule {}
