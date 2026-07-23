import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RechargeService } from './recharge.service';
import { CreateRechargeDto, PageQueryDto, RechargeNotifyDto } from '../../common/dto';
import { UserJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtPayload } from '../auth/auth-token.service';

@ApiTags('Recharge')
@Controller('api/v1')
export class RechargeController {
  constructor(private readonly rechargeService: RechargeService) {}

  @Post('recharge')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  async create(@CurrentUser() user: UserJwtPayload, @Body() dto: CreateRechargeDto) {
    const data = await this.rechargeService.create(user.sub, dto);
    return { status: 'success', data };
  }

  @Post('recharge/notify')
  async notify(@Body() dto: RechargeNotifyDto) {
    const data = await this.rechargeService.handleNotify(dto);
    return data;
  }

  @Get('recharges')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  async list(
    @CurrentUser() user: UserJwtPayload,
    @Query() query: PageQueryDto & { status?: string },
  ) {
    const data = await this.rechargeService.list(user.sub, query);
    return { status: 'success', data };
  }
}
