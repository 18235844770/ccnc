import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { PageQueryDto, WithdrawDto } from '../../common/dto';
import { UserJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtPayload } from '../auth/auth-token.service';

@ApiTags('Wallets')
@Controller('api/v1')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('wallets')
  async wallets(@CurrentUser() user: UserJwtPayload) {
    const data = await this.walletService.listWallets(user.sub);
    return { status: 'success', data };
  }

  @Get('wallets/ledger')
  async ledger(
    @CurrentUser() user: UserJwtPayload,
    @Query() query: PageQueryDto & { wallet_type?: string },
  ) {
    const data = await this.walletService.listLedger(user.sub, query);
    return { status: 'success', data };
  }

  @Post('withdraw')
  async withdraw(@CurrentUser() user: UserJwtPayload, @Body() dto: WithdrawDto) {
    const data = await this.walletService.withdraw(user.sub, dto);
    return { status: 'success', data };
  }

  @Get('withdraws')
  async withdraws(
    @CurrentUser() user: UserJwtPayload,
    @Query() query: PageQueryDto & { status?: string },
  ) {
    const data = await this.walletService.listWithdraws(user.sub, query);
    return { status: 'success', data };
  }
}
