import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { StatsService } from './stats.service';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';
import { ExportStatsDto } from '../../common/dto';
import type { StatsQuery } from './stats.utils';

@ApiTags('Admin Stats')
@Controller('api/v1/admin/stats')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  async overview(@Query() query: StatsQuery) {
    const data = await this.statsService.overview(query);
    return { status: 'success', data };
  }

  @Get('users/growth')
  async userGrowth(@Query() query: StatsQuery) {
    const data = await this.statsService.userGrowth(query);
    return { status: 'success', data };
  }

  @Get('users/conversion')
  async userConversion(@Query() query: StatsQuery) {
    const data = await this.statsService.userConversion(query);
    return { status: 'success', data };
  }

  @Get('promo/summary')
  async promoSummary(@Query() query: StatsQuery) {
    const data = await this.statsService.promoSummary(query);
    return { status: 'success', data };
  }

  @Get('promo/top')
  async promoTop(@Query() query: { by?: string; limit?: number }) {
    const data = await this.statsService.promoTop(query);
    return { status: 'success', data };
  }

  @Get('invest/summary')
  async investSummary(@Query() query: StatsQuery) {
    const data = await this.statsService.investSummary(query);
    return { status: 'success', data };
  }

  @Get('invest/by-product')
  async investByProduct(@Query() query: StatsQuery) {
    const data = await this.statsService.investByProduct(query);
    return { status: 'success', data };
  }

  @Get('commission/summary')
  async commissionSummary(@Query() query: StatsQuery) {
    const data = await this.statsService.commissionSummary(query);
    return { status: 'success', data };
  }

  @Get('commission/cost-rate')
  async commissionCostRate(@Query() query: StatsQuery) {
    const data = await this.statsService.commissionCostRate(query);
    return { status: 'success', data };
  }

  @Post('export')
  async export(@Body() dto: ExportStatsDto) {
    const data = await this.statsService.createExport(dto.type, dto);
    return { status: 'success', data };
  }

  @Get('export/:taskId/download')
  async downloadExport(@Param('taskId') taskId: string, @Res() res: Response) {
    const file = this.statsService.getExportFile(taskId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.content);
  }
}
