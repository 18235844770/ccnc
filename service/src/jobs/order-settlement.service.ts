import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JobLockService } from './job-lock.service';
import { decimalToNumber } from '../common/utils/mapper';

const BATCH_SIZE = 100;
const LOCK_KEY = 'job:order-settlement';
const LOCK_TTL = 55;

@Injectable()
export class OrderSettlementService {
  private readonly logger = new Logger(OrderSettlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobLock: JobLockService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSettlementCron() {
    await this.jobLock.runWithLock(LOCK_KEY, LOCK_TTL, () => this.settleExpiredOrders());
  }

  async settleExpiredOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'ACTIVE',
        end_date: { lte: new Date() },
      },
      take: BATCH_SIZE,
      orderBy: { end_date: 'asc' },
    });

    let settled = 0;
    for (const order of orders) {
      const ok = await this.settleOne(order.id);
      if (ok) settled += 1;
    }
    if (settled > 0) {
      this.logger.log(`Settled ${settled} orders`);
    }
    return { settled };
  }

  async settleOne(orderId: number) {
    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order || order.status !== 'ACTIVE') return;

        const principal = decimalToNumber(order.amount);
        const profit = decimalToNumber(order.profit);
        const total = principal + profit;

        let wallet = await tx.wallet.findUnique({
          where: { user_id_type: { user_id: order.user_id, type: 'BALANCE' } },
        });
        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { user_id: order.user_id, type: 'BALANCE' },
          });
        }

        const before = decimalToNumber(wallet.balance_available);
        const after = before + total;
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance_available: new Decimal(after), version: { increment: 1 } },
        });
        await tx.walletLog.create({
          data: {
            wallet_id: wallet.id,
            user_id: order.user_id,
            type: 'CREDIT',
            wallet_type: 'BALANCE',
            reference_id: String(orderId),
            reference_type: 'ORDER_SETTLE',
            amount: new Decimal(total),
            balance_before: new Decimal(before),
            balance_after: new Decimal(after),
            description: `Order settle principal ${principal} + profit ${profit}`,
          },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { status: 'SETTLED' },
        });
      });

      return true;
    } catch (e) {
      this.logger.warn(`Settle order ${orderId} failed: ${e}`);
      return false;
    }
  }
}
