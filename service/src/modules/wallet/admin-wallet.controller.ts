import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { AdjustBalanceDto, PageQueryDto, RejectWithdrawDto } from '../../common/dto';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentAdmin } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin Wallets')
@Controller('api/v1/admin')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('withdraws')
  async withdraws(
    @Query() query: PageQueryDto & { user_id?: number; status?: string },
  ) {
    const data = await this.walletService.listAdminWithdraws(query);
    return { status: 'success', data };
  }

  @Post('withdraws/:id/approve')
  async approve(@CurrentAdmin() admin: { sub: number }, @Param('id', ParseIntPipe) id: number) {
    await this.walletService.approveWithdraw(admin.sub, id);
    return { status: 'success', message: 'Withdraw approved' };
  }

  @Post('withdraws/:id/reject')
  async reject(
    @CurrentAdmin() admin: { sub: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectWithdrawDto,
  ) {
    await this.walletService.rejectWithdraw(admin.sub, id, dto.reason);
    return { status: 'success', message: 'Withdraw rejected' };
  }

  @Get('wallets/ledger')
  async ledger(
    @Query() query: PageQueryDto & { user_id?: number; biz_type?: string },
  ) {
    const data = await this.walletService.listAdminLedger(query);
    return { status: 'success', data };
  }

  @Post('wallets/adjustment')
  async adjustment(@CurrentAdmin() admin: { sub: number }, @Body() dto: AdjustBalanceDto) {
    await this.walletService.adjustBalance(admin.sub, dto);
    return { status: 'success', message: 'Balance adjusted' };
  }
}
