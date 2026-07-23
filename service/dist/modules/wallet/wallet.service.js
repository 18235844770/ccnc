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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const mapper_1 = require("../../common/utils/mapper");
const MIN_WITHDRAW = 100;
let WalletService = class WalletService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listWallets(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { user_id: userId },
            orderBy: { id: 'asc' },
        });
        return wallets.map(mapper_1.mapWallet);
    }
    async listLedger(userId, params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
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
        return (0, mapper_1.pageResult)(records.map(mapper_1.mapWalletLog), total);
    }
    async withdraw(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'User not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (user.status === 'BANNED') {
            throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'Account is banned', common_1.HttpStatus.FORBIDDEN);
        }
        if (user.status === 'FROZEN') {
            throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'Account is frozen', common_1.HttpStatus.FORBIDDEN);
        }
        const realname = await this.prisma.realnameAuth.findUnique({ where: { user_id: userId } });
        if (!realname || realname.auth_status !== 'APPROVED') {
            throw new business_exception_1.BusinessException('REALNAME_REQUIRED', 'Realname verification required', common_1.HttpStatus.FORBIDDEN);
        }
        const walletType = dto.wallet_type || 'BALANCE';
        if (dto.amount < MIN_WITHDRAW) {
            throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.WITHDRAW_TOO_LOW, `Minimum withdraw amount is ${MIN_WITHDRAW}`, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { user_id_type: { user_id: userId, type: walletType } },
            });
            if (!wallet) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'Wallet not found', common_1.HttpStatus.NOT_FOUND);
            }
            const available = (0, mapper_1.decimalToNumber)(wallet.balance_available);
            if (available < dto.amount) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.INSUFFICIENT_BALANCE, 'Insufficient balance', common_1.HttpStatus.BAD_REQUEST);
            }
            const afterAvailable = available - dto.amount;
            const frozenBefore = (0, mapper_1.decimalToNumber)(wallet.balance_frozen);
            const afterFrozen = frozenBefore + dto.amount;
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance_available: new library_1.Decimal(afterAvailable),
                    balance_frozen: new library_1.Decimal(afterFrozen),
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
                    amount: new library_1.Decimal(-dto.amount),
                    balance_before: new library_1.Decimal(available),
                    balance_after: new library_1.Decimal(afterAvailable),
                    description: dto.address ? `Withdraw to ${dto.address}` : 'Withdraw request',
                },
            });
            const record = await tx.withdraw.create({
                data: {
                    user_id: userId,
                    wallet_id: wallet.id,
                    amount: new library_1.Decimal(dto.amount),
                    status: 'PENDING',
                    reason: dto.address ? `address:${dto.address}` : undefined,
                },
            });
            return { withdraw_id: record.id };
        });
    }
    async listWithdraws(userId, params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
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
        return (0, mapper_1.pageResult)(records.map(mapper_1.mapWithdraw), total);
    }
    async listAdminWithdraws(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const dbStatus = params.status === 'SUCCESS' ? 'PAID' : params.status;
        const where = {
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
        return (0, mapper_1.pageResult)(records.map(mapper_1.mapWithdraw), total);
    }
    async approveWithdraw(adminId, withdrawId) {
        return this.prisma.$transaction(async (tx) => {
            const withdraw = await tx.withdraw.findUnique({ where: { id: withdrawId } });
            if (!withdraw) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.WITHDRAW_NOT_FOUND, 'Withdraw not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (withdraw.status !== 'PENDING') {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.INVALID_WITHDRAW_STATUS, 'Withdraw is not pending', common_1.HttpStatus.BAD_REQUEST);
            }
            const wallet = await tx.wallet.findUnique({ where: { id: withdraw.wallet_id } });
            if (!wallet) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'Wallet not found', common_1.HttpStatus.NOT_FOUND);
            }
            const amount = (0, mapper_1.decimalToNumber)(withdraw.amount);
            const frozen = (0, mapper_1.decimalToNumber)(wallet.balance_frozen);
            if (frozen < amount) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.INSUFFICIENT_BALANCE, 'Frozen balance insufficient', common_1.HttpStatus.BAD_REQUEST);
            }
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance_frozen: new library_1.Decimal(frozen - amount),
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
    async rejectWithdraw(adminId, withdrawId, reason) {
        return this.prisma.$transaction(async (tx) => {
            const withdraw = await tx.withdraw.findUnique({ where: { id: withdrawId } });
            if (!withdraw) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.WITHDRAW_NOT_FOUND, 'Withdraw not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (withdraw.status !== 'PENDING') {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.INVALID_WITHDRAW_STATUS, 'Withdraw is not pending', common_1.HttpStatus.BAD_REQUEST);
            }
            const wallet = await tx.wallet.findUnique({ where: { id: withdraw.wallet_id } });
            if (!wallet) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'Wallet not found', common_1.HttpStatus.NOT_FOUND);
            }
            const amount = (0, mapper_1.decimalToNumber)(withdraw.amount);
            const frozen = (0, mapper_1.decimalToNumber)(wallet.balance_frozen);
            const available = (0, mapper_1.decimalToNumber)(wallet.balance_available);
            const afterAvailable = available + amount;
            const afterFrozen = frozen - amount;
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance_available: new library_1.Decimal(afterAvailable),
                    balance_frozen: new library_1.Decimal(Math.max(0, afterFrozen)),
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
                    amount: new library_1.Decimal(amount),
                    balance_before: new library_1.Decimal(available),
                    balance_after: new library_1.Decimal(afterAvailable),
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
    async listAdminLedger(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
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
            ...(0, mapper_1.mapWalletLog)(log),
            type: log.reference_type,
        }));
        return (0, mapper_1.pageResult)(mapped, total);
    }
    async adjustBalance(adminId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { user_id_type: { user_id: dto.user_id, type: 'BALANCE' } },
            });
            if (!wallet) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'Wallet not found', common_1.HttpStatus.NOT_FOUND);
            }
            const before = (0, mapper_1.decimalToNumber)(wallet.balance_available);
            const after = before + dto.amount;
            if (after < 0) {
                throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.INSUFFICIENT_BALANCE, 'Balance cannot be negative', common_1.HttpStatus.BAD_REQUEST);
            }
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance_available: new library_1.Decimal(after),
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
                    amount: new library_1.Decimal(dto.amount),
                    balance_before: new library_1.Decimal(before),
                    balance_after: new library_1.Decimal(after),
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
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map