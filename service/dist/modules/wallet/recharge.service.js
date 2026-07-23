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
var RechargeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const mapper_1 = require("../../common/utils/mapper");
const MIN_RECHARGE = 100;
function generateBizId() {
    const rnd = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
    return `RC${Date.now()}${rnd}`;
}
let RechargeService = RechargeService_1 = class RechargeService {
    prisma;
    config;
    logger = new common_1.Logger(RechargeService_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async create(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'User not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (user.status === 'BANNED' || user.status === 'FROZEN') {
            throw new business_exception_1.BusinessException(business_exception_1.WalletErrors.NOT_FOUND, 'Account is not available', common_1.HttpStatus.FORBIDDEN);
        }
        if (dto.amount < MIN_RECHARGE) {
            throw new business_exception_1.BusinessException(business_exception_1.RechargeErrors.AMOUNT_TOO_LOW, `Minimum recharge amount is ${MIN_RECHARGE}`, common_1.HttpStatus.BAD_REQUEST);
        }
        const channel = dto.channel || 'ALIPAY';
        const bizId = generateBizId();
        const order = await this.prisma.rechargeOrder.create({
            data: {
                user_id: userId,
                biz_id: bizId,
                amount: new library_1.Decimal(dto.amount),
                status: 'PENDING',
                channel,
            },
        });
        const h5Base = this.config.get('H5_BASE_URL') || 'http://localhost:5174';
        const payUrl = `${h5Base}/#/pages/wallet/recharge-result?biz_id=${encodeURIComponent(bizId)}&amount=${dto.amount}`;
        return {
            recharge_id: order.id,
            biz_id: bizId,
            amount: dto.amount,
            channel,
            pay_url: payUrl,
        };
    }
    async handleNotify(dto) {
        const notifySecret = this.config.get('PAY_NOTIFY_SECRET');
        if (notifySecret && dto.secret !== notifySecret) {
            throw new business_exception_1.BusinessException(business_exception_1.RechargeErrors.INVALID_NOTIFY, 'Invalid notify secret', common_1.HttpStatus.FORBIDDEN);
        }
        const order = await this.prisma.rechargeOrder.findUnique({ where: { biz_id: dto.biz_id } });
        if (!order) {
            throw new business_exception_1.BusinessException(business_exception_1.RechargeErrors.NOT_FOUND, 'Recharge order not found', common_1.HttpStatus.NOT_FOUND);
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
        const amount = (0, mapper_1.decimalToNumber)(order.amount);
        if (dto.amount != null && Math.abs(dto.amount - amount) > 0.01) {
            throw new business_exception_1.BusinessException(business_exception_1.RechargeErrors.AMOUNT_MISMATCH, 'Recharge amount mismatch', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.creditRecharge(order.id, order.user_id, order.biz_id, amount);
        this.logger.log(`Recharge success biz_id=${order.biz_id} user=${order.user_id} amount=${amount}`);
        return { status: 'success', message: 'Recharge successful', recharge_id: order.id };
    }
    async creditRecharge(rechargeId, userId, bizId, amount) {
        await this.prisma.$transaction(async (tx) => {
            const current = await tx.rechargeOrder.findUnique({ where: { id: rechargeId } });
            if (!current || current.status === 'SUCCESS')
                return;
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
                    reference_id: bizId,
                    reference_type: 'RECHARGE',
                    amount: new library_1.Decimal(amount),
                    balance_before: new library_1.Decimal(before),
                    balance_after: new library_1.Decimal(after),
                    description: 'Recharge',
                },
            });
            await tx.rechargeOrder.update({
                where: { id: rechargeId },
                data: { status: 'SUCCESS' },
            });
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
            this.prisma.rechargeOrder.count({ where }),
            this.prisma.rechargeOrder.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        return (0, mapper_1.pageResult)(records.map(mapper_1.mapRecharge), total);
    }
};
exports.RechargeService = RechargeService;
exports.RechargeService = RechargeService = RechargeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], RechargeService);
//# sourceMappingURL=recharge.service.js.map