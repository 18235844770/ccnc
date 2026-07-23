import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PromotionService } from './promotion.service';
import { PageQueryDto } from '../../common/dto';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentAdmin } from '../../common/decorators/current-user.decorator';
import { AdminJwtPayload } from '../auth/auth-token.service';

class AuditDistributorDto {
  status!: 1 | 2;
  reason!: string;
}

class UpdateLevelDto {
  level_id!: number;
  reason!: string;
}

class ResetLinkDto {
  reason!: string;
}

@ApiTags('Admin Promotion')
@Controller('api/v1/admin')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminPromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get('distributors')
  async listDistributors(
    @Query() query: PageQueryDto & { level_id?: number; audit_status?: number },
  ) {
    const data = await this.promotionService.listDistributors(query);
    return { status: 'success', data };
  }

  @Get('distributors/:userId')
  async detail(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.promotionService.getDistributorDetail(userId);
    return { status: 'success', data };
  }

  @Post('distributors/:userId/audit')
  async audit(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AuditDistributorDto,
  ) {
    await this.promotionService.auditDistributor(admin.sub, userId, dto.status, dto.reason);
    return { status: 'success', message: 'Audit completed' };
  }

  @Post('distributors/:userId/level')
  async updateLevel(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateLevelDto,
  ) {
    await this.promotionService.updateDistributorLevel(admin.sub, userId, dto.level_id, dto.reason);
    return { status: 'success', message: 'Level updated' };
  }

  @Get('distributors/:userId/orders')
  async orders(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PageQueryDto,
  ) {
    const data = await this.promotionService.listDistributorOrders(userId, query);
    return { status: 'success', data };
  }

  @Get('promo/users/:userId/link')
  async promoLink(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.promotionService.getUserPromoLink(userId);
    return { status: 'success', data };
  }

  @Post('promo/users/:userId/link/reset')
  async resetLink(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ResetLinkDto,
  ) {
    const data = await this.promotionService.resetUserPromoLink(admin.sub, userId, dto.reason);
    return { status: 'success', data };
  }
}
