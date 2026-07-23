import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CommissionService } from './commission.service';
import { PageQueryDto } from '../../common/dto';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';

class ReasonDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

class ManualCommissionDto {
  @IsNumber()
  user_id!: number;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

class PublishRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  config!: string;
}

@ApiTags('Admin Commissions')
@Controller('api/v1/admin')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminCommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('commissions')
  async list(
    @Query() query: PageQueryDto & { user_id?: number; status?: string; type?: string },
  ) {
    const data = await this.commissionService.listAdmin(query);
    return { status: 'success', data };
  }

  @Get('commissions/:id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const data = await this.commissionService.getAdmin(id);
    return { status: 'success', data };
  }

  @Post('commissions/:id/freeze')
  async freeze(@Param('id', ParseIntPipe) id: number, @Body() dto: ReasonDto) {
    await this.commissionService.freeze(id, dto.reason);
    return { status: 'success', message: 'Commission frozen' };
  }

  @Post('commissions/:id/unfreeze')
  async unfreeze(@Param('id', ParseIntPipe) id: number, @Body() dto: ReasonDto) {
    await this.commissionService.unfreeze(id, dto.reason);
    return { status: 'success', message: 'Commission unfrozen' };
  }

  @Post('commissions/:id/void')
  async voidOne(@Param('id', ParseIntPipe) id: number, @Body() dto: ReasonDto) {
    await this.commissionService.void(id, dto.reason);
    return { status: 'success', message: 'Commission voided' };
  }

  @Post('commissions/manual-credit')
  async manualCredit(@Body() dto: ManualCommissionDto) {
    await this.commissionService.manualCredit(dto);
    return { status: 'success', message: 'Manual credit done' };
  }

  @Post('commissions/manual-reverse')
  async manualReverse(@Body() dto: ManualCommissionDto) {
    await this.commissionService.manualReverse(dto);
    return { status: 'success', message: 'Manual reverse done' };
  }

  @Post('commission-rules/publish')
  async publishRule(@Body() dto: PublishRuleDto) {
    const data = await this.commissionService.publishRule(dto);
    return { status: 'success', data };
  }

  @Get('commission-rules')
  async listRules() {
    const data = await this.commissionService.listRules();
    return { status: 'success', data };
  }

  @Get('commission-rules/active')
  async activeRule() {
    const data = await this.commissionService.getActiveRuleDetail();
    return { status: 'success', data };
  }

  @Post('commissions/run-settlement')
  async runSettlement() {
    const data = await this.commissionService.runSettlementCycle();
    return { status: 'success', data };
  }
}
