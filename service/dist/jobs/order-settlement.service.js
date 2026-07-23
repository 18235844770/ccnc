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
var OrderSettlementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSettlementService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../prisma/prisma.service");
const job_lock_service_1 = require("./job-lock.service");
const mapper_1 = require("../common/utils/mapper");
const BATCH_SIZE = 100;
const LOCK_KEY = 'job:order-settlement';
const LOCK_TTL = 55;
let OrderSettlementService = OrderSettlementService_1 = class OrderSettlementService {
    prisma;
    jobLock;
    logger = new common_1.Logger(OrderSettlementService_1.name);
    constructor(prisma, jobLock) {
        this.prisma = prisma;
        this.jobLock = jobLock;
    }
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
            if (ok)
                settled += 1;
        }
        if (settled > 0) {
            this.logger.log(`Settled ${settled} orders`);
        }
        return { settled };
    }
    async settleOne(orderId) {
        try {
            await this.prisma.$transaction(async (tx) => {
                const order = await tx.order.findUnique({ where: { id: orderId } });
                if (!order || order.status !== 'ACTIVE')
                    return;
                const principal = (0, mapper_1.decimalToNumber)(order.amount);
                const profit = (0, mapper_1.decimalToNumber)(order.profit);
                const total = principal + profit;
                let wallet = await tx.wallet.findUnique({
                    where: { user_id_type: { user_id: order.user_id, type: 'BALANCE' } },
                });
                if (!wallet) {
                    wallet = await tx.wallet.create({
                        data: { user_id: order.user_id, type: 'BALANCE' },
                    });
                }
                const before = (0, mapper_1.decimalToNumber)(wallet.balance_available);
                const after = before + total;
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance_available: new library_1.Decimal(after), version: { increment: 1 } },
                });
                await tx.walletLog.create({
                    data: {
                        wallet_id: wallet.id,
                        user_id: order.user_id,
                        type: 'CREDIT',
                        wallet_type: 'BALANCE',
                        reference_id: String(orderId),
                        reference_type: 'ORDER_SETTLE',
                        amount: new library_1.Decimal(total),
                        balance_before: new library_1.Decimal(before),
                        balance_after: new library_1.Decimal(after),
                        description: `Order settle principal ${principal} + profit ${profit}`,
                    },
                });
                await tx.order.update({
                    where: { id: orderId },
                    data: { status: 'SETTLED' },
                });
            });
            return true;
        }
        catch (e) {
            this.logger.warn(`Settle order ${orderId} failed: ${e}`);
            return false;
        }
    }
};
exports.OrderSettlementService = OrderSettlementService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderSettlementService.prototype, "handleSettlementCron", null);
exports.OrderSettlementService = OrderSettlementService = OrderSettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        job_lock_service_1.JobLockService])
], OrderSettlementService);
//# sourceMappingURL=order-settlement.service.js.map