import { Injectable, HttpStatus } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WithdrawDto } from '../../common/dto';
import { BusinessException, WalletErrors } from '../../common/exceptions/business.exception';
import { mapWallet, mapWalletLog, mapWithdraw, pageResult, decimalToNumber } from '../../common/utils/mapper';

const MIN_WITHDRAW = 100;

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async listWallets(userId: number) {
    const wallets = await this.prisma.wallet.findMany({
      where: { user_id: userId },
      orderBy: { id: 'asc' },
    });
    return wallets.map(mapWallet);
  }

  async listLedger(
    userId: number,
    params: { page?: number; page_size?: number; wallet_type?: string },
  ) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.WalletLogWhereInput = {
      user_id: userId,
      ...(params.wallet_type ? { wallet_type: params.wallet_type } : {}),
    };
    const [total, records] = await Promise.all([
      this.prisma.walletLog.count({ where }),
      this.prisma.walletLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);
    return pageResult(records.map(mapWalletLog), total);
  }

  async withdraw(userId: number, dto: WithdrawDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(WalletErrors.NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }
    if (user.status === 'BANNED') {
      throw new BusinessException(WalletErrors.NOT_FOUND, 'Account is banned', HttpStatus.FORBIDDEN);
    }
    if (user.status === 'FROZEN') {
      throw new BusinessException(WalletErrors.NOT_FOUND, 'Account is frozen', HttpStatus.FORBIDDEN);
    }

    const realname = await this.prisma.realnameAuth.findUnique({ where: { user_id: userId } });
    if (!realname || realname.auth_status !== 'APPROVED') {
      throw new BusinessException('REALNAME_REQUIRED', 'Realname verification required', HttpStatus.FORBIDDEN);
    }

    const walletType = dto.wallet_type || 'BALANCE';
    if (dto.amount < MIN_WITHDRAW) {
      throw new BusinessException(
        WalletErrors.WITHDRAW_TOO_LOW,
        `Minimum withdraw amount is ${MIN_WITHDRAW}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { user_id_type: { user_id: userId, type: walletType } },
      });
      if (!wallet) {
        throw new BusinessException(WalletErrors.NOT_FOUND, 'Wallet not found', HttpStatus.NOT_FOUND);
      }

      const available = decimalToNumber(wallet.balance_available);
      if (available < dto.amount) {
        throw new BusinessException(WalletErrors.INSUFFICIENT_BALANCE, 'Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      const afterAvailable = available - dto.amount;
      const frozenBefore = decimalToNumber(wallet.balance_frozen);
      const afterFrozen = frozenBefore + dto.amount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance_available: new Decimal(afterAvailable),
          balance_frozen: new Decimal(afterFrozen),
          version: { increment: 1 },
        },
      });

      await tx.walletLog.create({
        data: {
          wallet_id: wallet.id,
          user_id: userId,
          type: 'DEBIT',
          wallet_type: walletType,
          reference_id: `WITHDRAW_${Date.now()}`,
          reference_type: 'WITHDRAW',
          amount: new Decimal(-dto.amount),
          balance_before: new Decimal(available),
          balance_after: new Decimal(afterAvailable),
          description: dto.address ? `Withdraw to ${dto.address}` : 'Withdraw request',
        },
      });

      const record = await tx.withdraw.create({
        data: {
          user_id: userId,
          wallet_id: wallet.id,
          amount: new Decimal(dto.amount),
          status: 'PENDING',
          reason: dto.address ? `address:${dto.address}` : undefined,
        },
      });

      return { withdraw_id: record.id };
    });
  }

  async listWithdraws(userId: number, params: { page?: number; page_size?: number; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.WithdrawWhereInput = {
      user_id: userId,
      ...(params.status ? { status: params.status } : {}),
    };
    const [total, records] = await Promise.all([
      this.prisma.withdraw.count({ where }),
      this.prisma.withdraw.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);
    return pageResult(records.map(mapWithdraw), total);
  }

  async listAdminWithdraws(params: {
    page?: number;
    page_size?: number;
    user_id?: number;
    status?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const dbStatus = params.status === 'SUCCESS' ? 'PAID' : params.status;
    const where: Prisma.WithdrawWhereInput = {
      ...(params.user_id ? { user_id: params.user_id } : {}),
      ...(dbStatus ? { status: dbStatus } : {}),
    };
    const [total, records] = await Promise.all([
      this.prisma.withdraw.count({ where }),
      this.prisma.withdraw.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);
    return pageResult(records.map(mapWithdraw), total);
  }

  async approveWithdraw(adminId: number, withdrawId: number) {
    return this.prisma.$transaction(async (tx) => {
      const withdraw = await tx.withdraw.findUnique({ where: { id: withdrawId } });
      if (!withdraw) {
        throw new BusinessException(WalletErrors.WITHDRAW_NOT_FOUND, 'Withdraw not found', HttpStatus.NOT_FOUND);
      }
      if (withdraw.status !== 'PENDING') {
        throw new BusinessException(WalletErrors.INVALID_WITHDRAW_STATUS, 'Withdraw is not pending', HttpStatus.BAD_REQUEST);
      }

      const wallet = await tx.wallet.findUnique({ where: { id: withdraw.wallet_id } });
      if (!wallet) {
        throw new BusinessException(WalletErrors.NOT_FOUND, 'Wallet not found', HttpStatus.NOT_FOUND);
      }

      const amount = decimalToNumber(withdraw.amount);
      const frozen = decimalToNumber(wallet.balance_frozen);
      if (frozen < amount) {
        throw new BusinessException(WalletErrors.INSUFFICIENT_BALANCE, 'Frozen balance insufficient', HttpStatus.BAD_REQUEST);
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance_frozen: new Decimal(frozen - amount),
          version: { increment: 1 },
        },
      });

      await tx.withdraw.update({
        where: { id: withdrawId },
        data: { status: 'PAID', audit_admin_id: adminId },
      });

      await tx.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'WITHDRAW_APPROVE',
          target_type: 'WITHDRAW',
          target_id: withdrawId,
          reason: 'Approved',
        },
      });

      return { status: 'success' };
    });
  }

  async rejectWithdraw(adminId: number, withdrawId: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const withdraw = await tx.withdraw.findUnique({ where: { id: withdrawId } });
      if (!withdraw) {
        throw new BusinessException(WalletErrors.WITHDRAW_NOT_FOUND, 'Withdraw not found', HttpStatus.NOT_FOUND);
      }
      if (withdraw.status !== 'PENDING') {
        throw new BusinessException(WalletErrors.INVALID_WITHDRAW_STATUS, 'Withdraw is not pending', HttpStatus.BAD_REQUEST);
      }

      const wallet = await tx.wallet.findUnique({ where: { id: withdraw.wallet_id } });
      if (!wallet) {
        throw new BusinessException(WalletErrors.NOT_FOUND, 'Wallet not found', HttpStatus.NOT_FOUND);
      }

      const amount = decimalToNumber(withdraw.amount);
      const frozen = decimalToNumber(wallet.balance_frozen);
      const available = decimalToNumber(wallet.balance_available);
      const afterAvailable = available + amount;
      const afterFrozen = frozen - amount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance_available: new Decimal(afterAvailable),
          balance_frozen: new Decimal(Math.max(0, afterFrozen)),
          version: { increment: 1 },
        },
      });

      await tx.walletLog.create({
        data: {
          wallet_id: wallet.id,
          user_id: withdraw.user_id,
          type: 'CREDIT',
          wallet_type: wallet.type,
          reference_id: String(withdrawId),
          reference_type: 'WITHDRAW_REJECT',
          amount: new Decimal(amount),
          balance_before: new Decimal(available),
          balance_after: new Decimal(afterAvailable),
          description: `Withdraw rejected: ${reason}`,
        },
      });

      await tx.withdraw.update({
        where: { id: withdrawId },
        data: { status: 'REJECTED', reason, audit_admin_id: adminId },
      });

      await tx.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'WITHDRAW_REJECT',
          target_type: 'WITHDRAW',
          target_id: withdrawId,
          reason,
        },
      });

      return { status: 'success' };
    });
  }

  async listAdminLedger(params: {
    page?: number;
    page_size?: number;
    user_id?: number;
    biz_type?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.WalletLogWhereInput = {
      ...(params.user_id ? { user_id: params.user_id } : {}),
      ...(params.biz_type ? { reference_type: params.biz_type } : {}),
    };
    const [total, records] = await Promise.all([
      this.prisma.walletLog.count({ where }),
      this.prisma.walletLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);
    const mapped = records.map((log) => ({
      ...mapWalletLog(log),
      type: log.reference_type,
    }));
    return pageResult(mapped, total);
  }

  async adjustBalance(adminId: number, dto: { user_id: number; amount: number; description: string }) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { user_id_type: { user_id: dto.user_id, type: 'BALANCE' } },
      });
      if (!wallet) {
        throw new BusinessException(WalletErrors.NOT_FOUND, 'Wallet not found', HttpStatus.NOT_FOUND);
      }

      const before = decimalToNumber(wallet.balance_available);
      const after = before + dto.amount;
      if (after < 0) {
        throw new BusinessException(WalletErrors.INSUFFICIENT_BALANCE, 'Balance cannot be negative', HttpStatus.BAD_REQUEST);
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance_available: new Decimal(after),
          version: { increment: 1 },
        },
      });

      await tx.walletLog.create({
        data: {
          wallet_id: wallet.id,
          user_id: dto.user_id,
          type: dto.amount >= 0 ? 'CREDIT' : 'DEBIT',
          wallet_type: 'BALANCE',
          reference_id: `ADJ_${Date.now()}`,
          reference_type: 'ADJUSTMENT',
          amount: new Decimal(dto.amount),
          balance_before: new Decimal(before),
          balance_after: new Decimal(after),
          description: dto.description,
        },
      });

      await tx.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'WALLET_ADJUST',
          target_type: 'WALLET',
          target_id: wallet.id,
          reason: dto.description,
        },
      });

      return { status: 'success' };
    });
  }
}
