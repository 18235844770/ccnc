import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PromotionService } from './promotion.service';
import { PageQueryDto } from '../../common/dto';
import { UserJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtPayload } from '../auth/auth-token.service';

@ApiTags('Promotion')
@Controller('api/v1/promotion')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get('summary')
  async summary(@CurrentUser() user: UserJwtPayload) {
    const data = await this.promotionService.getSummary(user.sub);
    return { status: 'success', data };
  }

  @Get('downlines')
  async downlines(
    @CurrentUser() user: UserJwtPayload,
    @Query() query: PageQueryDto & { level?: number },
  ) {
    const data = await this.promotionService.listDownlines(user.sub, query);
    return { status: 'success', data };
  }
}
