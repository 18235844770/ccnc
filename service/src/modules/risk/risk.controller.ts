import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RiskService } from './risk.service';
import { PageQueryDto } from '../../common/dto';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentAdmin } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin Risk')
@Controller('api/v1/admin/risk')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get('dashboard')
  async dashboard() {
    const data = await this.riskService.getDashboard();
    return { status: 'success', data };
  }

  @Get('events')
  async events(
    @Query() query: PageQueryDto & { status?: string; rule_code?: string; user_id?: number },
  ) {
    const data = await this.riskService.listEvents(query);
    return { status: 'success', data };
  }

  @Get('rules')
  async rules() {
    const data = await this.riskService.listRules();
    return { status: 'success', data };
  }

  @Post('events/:id/resolve')
  async resolve(
    @CurrentAdmin() admin: { sub: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { action: string; reason?: string },
  ) {
    await this.riskService.resolveEvent(admin.sub, id, body.action, body.reason);
    return { status: 'success', message: 'Event resolved' };
  }

  @Post('scan')
  async manualScan() {
    const data = await this.riskService.runScan();
    return { status: 'success', data };
  }
}
