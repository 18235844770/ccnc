import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalToNumber } from '../../common/utils/mapper';

export function calcUnlockRatio(validCount: number): number {
  if (validCount >= 3) return 1;
  if (validCount === 2) return 2 / 3;
  if (validCount === 1) return 1 / 3;
  return 0;
}

@Injectable()
export class InviteProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(userId: number) {
    const progress = await this.prisma.inviteProgress.findUnique({ where: { user_id: userId } });
    if (!progress) {
      return { valid_count: 0, unlock_ratio: 0, unlock_percent: 0 };
    }
    const ratio = decimalToNumber(progress.unlock_ratio);
    return {
      valid_count: progress.valid_count,
      unlock_ratio: ratio,
      unlock_percent: Math.round(ratio * 100),
    };
  }

  async recordFirstInvestment(buyerUserId: number, orderId: number) {
    const relation = await this.prisma.userRelation.findUnique({
      where: { user_id: buyerUserId },
    });
    if (!relation) return { recorded: false };

    const existing = await this.prisma.validInvite.findUnique({
      where: { invitee_user_id: buyerUserId },
    });
    if (existing) return { recorded: false, skipped: true };

    const priorOrders = await this.prisma.order.count({
      where: {
        user_id: buyerUserId,
        id: { not: orderId },
        status: { in: ['ACTIVE', 'SETTLED', 'PAID'] },
      },
    });
    if (priorOrders > 0) return { recorded: false, skipped: true };

    const inviterId = relation.parent_user_id;
    await this.prisma.$transaction(async (tx) => {
      await tx.validInvite.create({
        data: {
          inviter_user_id: inviterId,
          invitee_user_id: buyerUserId,
          order_id: orderId,
        },
      });

      const current = await tx.inviteProgress.findUnique({ where: { user_id: inviterId } });
      const validCount = (current?.valid_count ?? 0) + 1;
      const unlockRatio = calcUnlockRatio(validCount);

      await tx.inviteProgress.upsert({
        where: { user_id: inviterId },
        update: {
          valid_count: validCount,
          unlock_ratio: new Decimal(unlockRatio),
        },
        create: {
          user_id: inviterId,
          valid_count: validCount,
          unlock_ratio: new Decimal(unlockRatio),
        },
      });
    });

    return { recorded: true, inviter_id: inviterId };
  }

  async getUnlockRatioForUser(userId: number): Promise<number> {
    const progress = await this.prisma.inviteProgress.findUnique({ where: { user_id: userId } });
    return progress ? decimalToNumber(progress.unlock_ratio) : 0;
  }
}
