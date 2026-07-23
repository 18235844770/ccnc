import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PromotionService } from '../promotion/promotion.service';
import { PageQueryDto } from '../../common/dto';
import { UserJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtPayload } from '../auth/auth-token.service';

@ApiTags('Commissions')
@Controller('api/v1/commissions')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class CommissionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  async list(
    @CurrentUser() user: UserJwtPayload,
    @Query() query: PageQueryDto & { status?: string },
  ) {
    const data = await this.promotionService.listCommissions(user.sub, query);
    return { status: 'success', data };
  }

  @Get('summary')
  async summary(@CurrentUser() user: UserJwtPayload) {
    const data = await this.promotionService.getCommissionSummary(user.sub);
    return { status: 'success', data };
  }
}
