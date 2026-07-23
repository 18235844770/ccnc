import { Injectable, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, PayOrderDto } from '../../common/dto';
import { BusinessException, OrderErrors } from '../../common/exceptions/business.exception';
import { mapOrder, pageResult, decimalToNumber } from '../../common/utils/mapper';
import { CommissionService } from '../commission/commission.service';
import { QueueService } from '../../queue/queue.service';
import { InviteProgressService } from '../promotion/invite-progress.service';

function generateOrderNo(): string {
  const rnd = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `CC${Date.now()}${rnd}`;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => CommissionService))
    private readonly commissionService: CommissionService,
    private readonly queueService: QueueService,
    private readonly inviteProgress: InviteProgressService,
  ) {}

  private async ensureRealnameApproved(userId: number) {
    const realname = await this.prisma.realnameAuth.findUnique({ where: { user_id: userId } });
    if (!realname || realname.auth_status !== 'APPROVED') {
      throw new BusinessException('REALNAME_REQUIRED', 'Realname verification required', HttpStatus.FORBIDDEN);
    }
  }

  async create(userId: number, dto: CreateOrderDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'NORMAL') {
      throw new BusinessException(OrderErrors.NOT_FOUND, 'User not available', HttpStatus.FORBIDDEN);
    }
    await this.ensureRealnameApproved(userId);

    const product = await this.prisma.product.findFirst({
      where: { id: dto.product_id, status: 'ON_SALE', deleted_at: null },
    });
    if (!product) {
      throw new BusinessException(OrderErrors.PRODUCT_UNAVAILABLE, 'Product not available', HttpStatus.BAD_REQUEST);
    }

    const minAmount = decimalToNumber(product.min_amount);
    if (dto.amount < minAmount) {
      throw new BusinessException(
        OrderErrors.AMOUNT_TOO_LOW,
        `Minimum amount is ${minAmount}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (product.max_amount && dto.amount > decimalToNumber(product.max_amount)) {
      throw new BusinessException(OrderErrors.AMOUNT_TOO_LOW, 'Amount exceeds maximum', HttpStatus.BAD_REQUEST);
    }

    const order = await this.prisma.order.create({
      data: {
        order_no: generateOrderNo(),
        user_id: userId,
        product_id: product.id,
        amount: new Decimal(dto.amount),
        status: 'PENDING',
      },
    });

    return { order_id: order.id };
  }

  async pay(userId: number, orderId: number, dto: PayOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: { product: true },
    });
    if (!order) {
      throw new BusinessException(OrderErrors.NOT_FOUND, 'Order not found', HttpStatus.NOT_FOUND);
    }
    if (order.status !== 'PENDING') {
      throw new BusinessException(OrderErrors.INVALID_STATUS, 'Order is not pending', HttpStatus.BAD_REQUEST);
    }
    await this.ensureRealnameApproved(userId);

    const payAmount = decimalToNumber(order.amount);
    if (Math.abs(dto.payment_amount - payAmount) > 0.01) {
      throw new BusinessException(OrderErrors.INVALID_STATUS, 'Payment amount mismatch', HttpStatus.BAD_REQUEST);
    }

    if (dto.payment_method === 'BALANCE') {
      await this.payWithBalance(userId, order.id, payAmount);
      await this.triggerCommission(order.id, userId);
      return { status: 'success', message: 'Payment successful', order_id: order.id };
    }

    await this.markOrderPaid(order);
    await this.triggerCommission(order.id, userId);
    const h5Base = this.config.get<string>('H5_BASE_URL') || 'http://localhost:5174';
    const redirectUrl = `${h5Base}/#/pages/order/pay-callback?pay_success=1&order_id=${order.id}`;
    return { status: 'success', redirect_url: redirectUrl, pay_url: redirectUrl };
  }

  private async payWithBalance(userId: number, orderId: number, amount: number) {
    await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { user_id_type: { user_id: userId, type: 'BALANCE' } },
      });
      if (!wallet || decimalToNumber(wallet.balance_available) < amount) {
        throw new BusinessException(OrderErrors.INSUFFICIENT_BALANCE, 'Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      const before = decimalToNumber(wallet.balance_available);
      const after = before - amount;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance_available: new Decimal(after), version: { increment: 1 } },
      });
      await tx.walletLog.create({
        data: {
          wallet_id: wallet.id,
          user_id: userId,
          type: 'DEBIT',
          wallet_type: 'BALANCE',
          reference_id: String(orderId),
          reference_type: 'ORDER',
          amount: new Decimal(-amount),
          balance_before: new Decimal(before),
          balance_after: new Decimal(after),
          description: 'Order payment',
        },
      });

      const order = await tx.order.findUnique({ where: { id: orderId }, include: { product: true } });
      if (!order?.product) {
        throw new BusinessException(OrderErrors.NOT_FOUND, 'Order not found', HttpStatus.NOT_FOUND);
      }
      await this.markOrderPaidInTx(tx, order);
    });
  }

  private async markOrderPaid(order: { id: number; amount: Decimal; product: { yield_rate: Decimal; cycle_days: number } | null }) {
    await this.prisma.$transaction(async (tx) => {
      const full = await tx.order.findUnique({ where: { id: order.id }, include: { product: true } });
      if (!full?.product) return;
      await this.markOrderPaidInTx(tx, full);
    });
  }

  private async markOrderPaidInTx(
    tx: Prisma.TransactionClient,
    order: { id: number; amount: Decimal; product: { yield_rate: Decimal; cycle_days: number } },
  ) {
    const amount = decimalToNumber(order.amount);
    const rate = decimalToNumber(order.product.yield_rate);
    const days = order.product.cycle_days;
    const profit = amount * rate * (days / 365);
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'ACTIVE',
        profit: new Decimal(profit),
        start_date: now,
        end_date: end,
      },
    });
  }

  async list(userId: number, params: { page?: number; page_size?: number; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.OrderWhereInput = {
      user_id: userId,
      ...(params.status ? { status: params.status } : {}),
    };
    const [total, records] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: { product: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);
    return pageResult(records.map((o) => mapOrder(o)), total);
  }

  async get(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: { product: true },
    });
    if (!order) {
      throw new BusinessException(OrderErrors.NOT_FOUND, 'Order not found', HttpStatus.NOT_FOUND);
    }
    return mapOrder(order);
  }

  async cancel(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
    });
    if (!order) {
      throw new BusinessException(OrderErrors.NOT_FOUND, 'Order not found', HttpStatus.NOT_FOUND);
    }
    if (order.status !== 'PENDING') {
      throw new BusinessException(OrderErrors.INVALID_STATUS, 'Only pending orders can be cancelled', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
    return { status: 'success', message: 'Order cancelled' };
  }

  async refund(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
    });
    if (!order) {
      throw new BusinessException(OrderErrors.NOT_FOUND, 'Order not found', HttpStatus.NOT_FOUND);
    }
    if (order.status !== 'PAID' && order.status !== 'ACTIVE') {
      throw new BusinessException(OrderErrors.INVALID_STATUS, 'Order cannot be refunded', HttpStatus.BAD_REQUEST);
    }

    const amount = decimalToNumber(order.amount);
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'REFUNDED' },
      });

      const wallet = await tx.wallet.findUnique({
        where: { user_id_type: { user_id: userId, type: 'BALANCE' } },
      });
      if (wallet) {
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
            reference_id: String(orderId),
            reference_type: 'ORDER_REFUND',
            amount: new Decimal(amount),
            balance_before: new Decimal(before),
            balance_after: new Decimal(after),
            description: 'Order refund',
          },
        });
      }
    });

    await this.commissionService.voidForOrder(orderId);

    return { status: 'success', message: 'Refund submitted' };
  }

  async refundAdmin(adminId: number, orderId: number, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BusinessException(OrderErrors.NOT_FOUND, 'Order not found', HttpStatus.NOT_FOUND);
    }
    if (order.status !== 'PAID' && order.status !== 'ACTIVE') {
      throw new BusinessException(OrderErrors.INVALID_STATUS, 'Order cannot be refunded', HttpStatus.BAD_REQUEST);
    }

    await this.refund(order.user_id, orderId);

    await this.prisma.auditLog.create({
      data: {
        admin_id: adminId,
        action: 'ORDER_REFUND',
        target_type: 'ORDER',
        target_id: orderId,
        reason,
      },
    });

    return { status: 'success', message: 'Refund completed' };
  }

  async listAdmin(params: {
    page?: number;
    page_size?: number;
    status?: string;
    user_id?: number;
    order_no?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.OrderWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.user_id ? { user_id: params.user_id } : {}),
      ...(params.order_no ? { order_no: { contains: params.order_no } } : {}),
    };
    const [total, records] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: { product: true, user: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);
    const mapped = records.map((o) => ({
      ...mapOrder(o),
      username: o.user.username,
    }));
    return pageResult(mapped, total);
  }

  async getAdmin(orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
      include: { product: true, user: true },
    });
    if (!order) {
      throw new BusinessException(OrderErrors.NOT_FOUND, 'Order not found', HttpStatus.NOT_FOUND);
    }
    return {
      ...mapOrder(order),
      username: order.user.username,
      start_time: order.start_date?.toISOString(),
      end_time: order.end_date?.toISOString(),
    };
  }

  private async triggerCommission(orderId: number, buyerUserId: number) {
    try {
      await this.inviteProgress.recordFirstInvestment(buyerUserId, orderId);
      await this.queueService.enqueueOrderPaid(orderId);
    } catch (e) {
      console.warn(`Commission trigger failed for order ${orderId}:`, e);
    }
  }
}
