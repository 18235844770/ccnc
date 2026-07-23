"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const mapper_1 = require("../../common/utils/mapper");
const commission_service_1 = require("../commission/commission.service");
const queue_service_1 = require("../../queue/queue.service");
const invite_progress_service_1 = require("../promotion/invite-progress.service");
function generateOrderNo() {
    const rnd = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
    return `CC${Date.now()}${rnd}`;
}
let OrderService = class OrderService {
    prisma;
    config;
    commissionService;
    queueService;
    inviteProgress;
    constructor(prisma, config, commissionService, queueService, inviteProgress) {
        this.prisma = prisma;
        this.config = config;
        this.commissionService = commissionService;
        this.queueService = queueService;
        this.inviteProgress = inviteProgress;
    }
    async ensureRealnameApproved(userId) {
        const realname = await this.prisma.realnameAuth.findUnique({ where: { user_id: userId } });
        if (!realname || realname.auth_status !== 'APPROVED') {
            throw new business_exception_1.BusinessException('REALNAME_REQUIRED', 'Realname verification required', common_1.HttpStatus.FORBIDDEN);
        }
    }
    async create(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status !== 'NORMAL') {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.NOT_FOUND, 'User not available', common_1.HttpStatus.FORBIDDEN);
        }
        await this.ensureRealnameApproved(userId);
        const product = await this.prisma.product.findFirst({
            where: { id: dto.product_id, status: 'ON_SALE', deleted_at: null },
        });
        if (!product) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.PRODUCT_UNAVAILABLE, 'Product not available', common_1.HttpStatus.BAD_REQUEST);
        }
        const minAmount = (0, mapper_1.decimalToNumber)(product.min_amount);
        if (dto.amount < minAmount) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.AMOUNT_TOO_LOW, `Minimum amount is ${minAmount}`, common_1.HttpStatus.BAD_REQUEST);
        }
        if (product.max_amount && dto.amount > (0, mapper_1.decimalToNumber)(product.max_amount)) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.AMOUNT_TOO_LOW, 'Amount exceeds maximum', common_1.HttpStatus.BAD_REQUEST);
        }
        const order = await this.prisma.order.create({
            data: {
                order_no: generateOrderNo(),
                user_id: userId,
                product_id: product.id,
                amount: new library_1.Decimal(dto.amount),
                status: 'PENDING',
            },
        });
        return { order_id: order.id };
    }
    async pay(userId, orderId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, user_id: userId },
            include: { product: true },
        });
        if (!order) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.NOT_FOUND, 'Order not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (order.status !== 'PENDING') {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.INVALID_STATUS, 'Order is not pending', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.ensureRealnameApproved(userId);
        const payAmount = (0, mapper_1.decimalToNumber)(order.amount);
        if (Math.abs(dto.payment_amount - payAmount) > 0.01) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.INVALID_STATUS, 'Payment amount mismatch', common_1.HttpStatus.BAD_REQUEST);
        }
        if (dto.payment_method === 'BALANCE') {
            await this.payWithBalance(userId, order.id, payAmount);
            await this.triggerCommission(order.id, userId);
            return { status: 'success', message: 'Payment successful', order_id: order.id };
        }
        await this.markOrderPaid(order);
        await this.triggerCommission(order.id, userId);
        const h5Base = this.config.get('H5_BASE_URL') || 'http://localhost:5174';
        const redirectUrl = `${h5Base}/#/pages/order/pay-callback?pay_success=1&order_id=${order.id}`;
        return { status: 'success', redirect_url: redirectUrl, pay_url: redirectUrl };
    }
    async payWithBalance(userId, orderId, amount) {
        await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { user_id_type: { user_id: userId, type: 'BALANCE' } },
            });
            if (!wallet || (0, mapper_1.decimalToNumber)(wallet.balance_available) < amount) {
                throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.INSUFFICIENT_BALANCE, 'Insufficient balance', common_1.HttpStatus.BAD_REQUEST);
            }
            const before = (0, mapper_1.decimalToNumber)(wallet.balance_available);
            const after = before - amount;
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance_available: new library_1.Decimal(after), version: { increment: 1 } },
            });
            await tx.walletLog.create({
                data: {
                    wallet_id: wallet.id,
                    user_id: userId,
                    type: 'DEBIT',
                    wallet_type: 'BALANCE',
                    reference_id: String(orderId),
                    reference_type: 'ORDER',
                    amount: new library_1.Decimal(-amount),
                    balance_before: new library_1.Decimal(before),
                    balance_after: new library_1.Decimal(after),
                    description: 'Order payment',
                },
            });
            const order = await tx.order.findUnique({ where: { id: orderId }, include: { product: true } });
            if (!order?.product) {
                throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.NOT_FOUND, 'Order not found', common_1.HttpStatus.NOT_FOUND);
            }
            await this.markOrderPaidInTx(tx, order);
        });
    }
    async markOrderPaid(order) {
        await this.prisma.$transaction(async (tx) => {
            const full = await tx.order.findUnique({ where: { id: order.id }, include: { product: true } });
            if (!full?.product)
                return;
            await this.markOrderPaidInTx(tx, full);
        });
    }
    async markOrderPaidInTx(tx, order) {
        const amount = (0, mapper_1.decimalToNumber)(order.amount);
        const rate = (0, mapper_1.decimalToNumber)(order.product.yield_rate);
        const days = order.product.cycle_days;
        const profit = amount * rate * (days / 365);
        const now = new Date();
        const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        await tx.order.update({
            where: { id: order.id },
            data: {
                status: 'ACTIVE',
                profit: new library_1.Decimal(profit),
                start_date: now,
                end_date: end,
            },
        });
    }
    async list(userId, params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
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
        return (0, mapper_1.pageResult)(records.map((o) => (0, mapper_1.mapOrder)(o)), total);
    }
    async get(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, user_id: userId },
            include: { product: true },
        });
        if (!order) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.NOT_FOUND, 'Order not found', common_1.HttpStatus.NOT_FOUND);
        }
        return (0, mapper_1.mapOrder)(order);
    }
    async cancel(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, user_id: userId },
        });
        if (!order) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.NOT_FOUND, 'Order not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (order.status !== 'PENDING') {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.INVALID_STATUS, 'Only pending orders can be cancelled', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });
        return { status: 'success', message: 'Order cancelled' };
    }
    async refund(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, user_id: userId },
        });
        if (!order) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.NOT_FOUND, 'Order not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (order.status !== 'PAID' && order.status !== 'ACTIVE') {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.INVALID_STATUS, 'Order cannot be refunded', common_1.HttpStatus.BAD_REQUEST);
        }
        const amount = (0, mapper_1.decimalToNumber)(order.amount);
        await this.prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'REFUNDED' },
            });
            const wallet = await tx.wallet.findUnique({
                where: { user_id_type: { user_id: userId, type: 'BALANCE' } },
            });
            if (wallet) {
                const before = (0, mapper_1.decimalToNumber)(wallet.balance_available);
                const after = before + amount;
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance_available: new library_1.Decimal(after), version: { increment: 1 } },
                });
                await tx.walletLog.create({
                    data: {
                        wallet_id: wallet.id,
                        user_id: userId,
                        type: 'CREDIT',
                        wallet_type: 'BALANCE',
                        reference_id: String(orderId),
                        reference_type: 'ORDER_REFUND',
                        amount: new library_1.Decimal(amount),
                        balance_before: new library_1.Decimal(before),
                        balance_after: new library_1.Decimal(after),
                        description: 'Order refund',
                    },
                });
            }
        });
        await this.commissionService.voidForOrder(orderId);
        return { status: 'success', message: 'Refund submitted' };
    }
    async refundAdmin(adminId, orderId, reason) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.NOT_FOUND, 'Order not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (order.status !== 'PAID' && order.status !== 'ACTIVE') {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.INVALID_STATUS, 'Order cannot be refunded', common_1.HttpStatus.BAD_REQUEST);
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
    async listAdmin(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
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
            ...(0, mapper_1.mapOrder)(o),
            username: o.user.username,
        }));
        return (0, mapper_1.pageResult)(mapped, total);
    }
    async getAdmin(orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId },
            include: { product: true, user: true },
        });
        if (!order) {
            throw new business_exception_1.BusinessException(business_exception_1.OrderErrors.NOT_FOUND, 'Order not found', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            ...(0, mapper_1.mapOrder)(order),
            username: order.user.username,
            start_time: order.start_date?.toISOString(),
            end_time: order.end_date?.toISOString(),
        };
    }
    async triggerCommission(orderId, buyerUserId) {
        try {
            await this.inviteProgress.recordFirstInvestment(buyerUserId, orderId);
            await this.queueService.enqueueOrderPaid(orderId);
        }
        catch (e) {
            console.warn(`Commission trigger failed for order ${orderId}:`, e);
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => commission_service_1.CommissionService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        commission_service_1.CommissionService,
        queue_service_1.QueueService,
        invite_progress_service_1.InviteProgressService])
], OrderService);
//# sourceMappingURL=order.service.js.map