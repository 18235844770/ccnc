import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRechargeDto, RechargeNotifyDto } from '../../common/dto';
import { BusinessException, RechargeErrors, WalletErrors } from '../../common/exceptions/business.exception';
import { decimalToNumber, mapRecharge, pageResult } from '../../common/utils/mapper';

const MIN_RECHARGE = 100;

function generateBizId(): string {
  const rnd = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `RC${Date.now()}${rnd}`;
}

@Injectable()
export class RechargeService {
  private readonly logger = new Logger(RechargeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: number, dto: CreateRechargeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(WalletErrors.NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }
    if (user.status === 'BANNED' || user.status === 'FROZEN') {
      throw new BusinessException(WalletErrors.NOT_FOUND, 'Account is not available', HttpStatus.FORBIDDEN);
    }
    if (dto.amount < MIN_RECHARGE) {
      throw new BusinessException(
        RechargeErrors.AMOUNT_TOO_LOW,
        `Minimum recharge amount is ${MIN_RECHARGE}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const channel = dto.channel || 'ALIPAY';
    const bizId = generateBizId();
    const order = await this.prisma.rechargeOrder.create({
      data: {
        user_id: userId,
        biz_id: bizId,
        amount: new Decimal(dto.amount),
        status: 'PENDING',
        channel,
      },
    });

    const h5Base = this.config.get<string>('H5_BASE_URL') || 'http://localhost:5174';
    const payUrl = `${h5Base}/#/pages/wallet/recharge-result?biz_id=${encodeURIComponent(bizId)}&amount=${dto.amount}`;

    return {
      recharge_id: order.id,
      biz_id: bizId,
      amount: dto.amount,
      channel,
      pay_url: payUrl,
    };
  }

  async handleNotify(dto: RechargeNotifyDto) {
    const notifySecret = this.config.get<string>('PAY_NOTIFY_SECRET');
    if (notifySecret && dto.secret !== notifySecret) {
      throw new BusinessException(RechargeErrors.INVALID_NOTIFY, 'Invalid notify secret', HttpStatus.FORBIDDEN);
    }

    const order = await this.prisma.rechargeOrder.findUnique({ where: { biz_id: dto.biz_id } });
    if (!order) {
      throw new BusinessException(RechargeErrors.NOT_FOUND, 'Recharge order not found', HttpStatus.NOT_FOUND);
    }

    if (order.status === 'SUCCESS') {
      return { status: 'success', message: 'Already processed', recharge_id: order.id };
    }

    const notifyStatus = dto.status || 'SUCCESS';
    if (notifyStatus !== 'SUCCESS') {
      await this.prisma.rechargeOrder.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });
      return { status: 'success', message: 'Recharge marked failed' };
    }

    const amount = decimalToNumber(order.amount);
    if (dto.amount != null && Math.abs(dto.amount - amount) > 0.01) {
      throw new BusinessException(
        RechargeErrors.AMOUNT_MISMATCH,
        'Recharge amount mismatch',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.creditRecharge(order.id, order.user_id, order.biz_id, amount);
    this.logger.log(`Recharge success biz_id=${order.biz_id} user=${order.user_id} amount=${amount}`);

    return { status: 'success', message: 'Recharge successful', recharge_id: order.id };
  }

  private async creditRecharge(rechargeId: number, userId: number, bizId: string, amount: number) {
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.rechargeOrder.findUnique({ where: { id: rechargeId } });
      if (!current || current.status === 'SUCCESS') return;

      const existingLog = await tx.walletLog.findFirst({
        where: { reference_id: bizId, reference_type: 'RECHARGE' },
      });
      if (existingLog) {
        await tx.rechargeOrder.update({ where: { id: rechargeId }, data: { status: 'SUCCESS' } });
        return;
      }

      let wallet = await tx.wallet.findUnique({
        where: { user_id_type: { user_id: userId, type: 'BALANCE' } },
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { user_id: userId, type: 'BALANCE', balance_available: 0, balance_frozen: 0 },
        });
      }

      const before = decimalToNumber(wallet.balance_available);
      const after = before + amount;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance_available: new Decimal(after), version: { increment: 1 } },
      });
      await tx.walletLog.create({
        data: {
          wallet_id: wallet.id,
          user_id: userId,
          type: 'CREDIT',
          wallet_type: 'BALANCE',
          reference_id: bizId,
          reference_type: 'RECHARGE',
          amount: new Decimal(amount),
          balance_before: new Decimal(before),
          balance_after: new Decimal(after),
          description: 'Recharge',
        },
      });
      await tx.rechargeOrder.update({
        where: { id: rechargeId },
        data: { status: 'SUCCESS' },
      });
    });
  }

  async list(userId: number, params: { page?: number; page_size?: number; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.RechargeOrderWhereInput = {
      user_id: userId,
      ...(params.status ? { status: params.status } : {}),
    };
    const [total, records] = await Promise.all([
      this.prisma.rechargeOrder.count({ where }),
      this.prisma.rechargeOrder.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);
    return pageResult(records.map(mapRecharge), total);
  }
}
