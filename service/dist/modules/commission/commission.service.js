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
var CommissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const mapper_1 = require("../../common/utils/mapper");
const commission_config_1 = require("./commission.config");
let CommissionService = CommissionService_1 = class CommissionService {
    prisma;
    logger = new common_1.Logger(CommissionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getActiveRule() {
        const rule = await this.prisma.commissionRule.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { published_at: 'desc' },
        });
        if (!rule)
            return commission_config_1.DEFAULT_COMMISSION_RULE;
        try {
            return { ...commission_config_1.DEFAULT_COMMISSION_RULE, ...JSON.parse(rule.config) };
        }
        catch {
            return commission_config_1.DEFAULT_COMMISSION_RULE;
        }
    }
    async calculateForOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { product: true },
        });
        if (!order || !['PAID', 'ACTIVE', 'SETTLED'].includes(order.status)) {
            return { created: 0 };
        }
        const existing = await this.prisma.commission.count({
            where: { biz_id: String(orderId), biz_type: 'ORDER' },
        });
        if (existing > 0) {
            return { created: 0, skipped: true };
        }
        const relation = await this.prisma.userRelation.findUnique({
            where: { user_id: order.user_id },
        });
        if (!relation) {
            return { created: 0 };
        }
        const rule = await this.getActiveRule();
        const base = rule.base_type === 'PROFIT' && order.profit
            ? (0, mapper_1.decimalToNumber)(order.profit)
            : (0, mapper_1.decimalToNumber)(order.amount);
        const ancestors = (0, commission_config_1.parseAncestors)(relation.path, relation.parent_user_id, rule.max_level);
        const snapshotData = {
            ...rule,
            order_id: orderId,
            base_amount: base,
            calculated_at: new Date().toISOString(),
        };
        const snapshot = JSON.stringify(snapshotData);
        const rows = [];
        for (const anc of ancestors) {
            let rate = rule.rates[anc.level - 1] ?? 0;
            if (rate <= 0)
                continue;
            let unlockRatio = 1;
            if (anc.level === 1) {
                const progress = await this.prisma.inviteProgress.findUnique({
                    where: { user_id: anc.userId },
                });
                unlockRatio = progress ? (0, mapper_1.decimalToNumber)(progress.unlock_ratio) : 0;
                rate = rate * unlockRatio;
            }
            const amount = Math.round(base * rate * 100) / 100;
            if (amount <= 0)
                continue;
            rows.push({
                biz_type: 'ORDER',
                biz_id: String(orderId),
                event_id: `order.paid:${orderId}`,
                from_user_id: order.user_id,
                to_user_id: anc.userId,
                relation_level: anc.level,
                amount: new library_1.Decimal(amount),
                status: 'PENDING',
                rule_snapshot: JSON.stringify({ ...snapshotData, unlock_ratio: unlockRatio }),
            });
        }
        if (!rows.length) {
            return { created: 0 };
        }
        const result = await this.prisma.commission.createMany({ data: rows, skipDuplicates: true });
        this.logger.log(`Commission calculated for order ${orderId}: ${result.count} records`);
        return { created: result.count };
    }
    async voidForOrder(orderId) {
        const commissions = await this.prisma.commission.findMany({
            where: {
                biz_id: String(orderId),
                biz_type: 'ORDER',
                status: { in: ['PENDING', 'SETTLED', 'FROZEN'] },
            },
        });
        for (const c of commissions) {
            await this.prisma.commission.update({
                where: { id: c.id },
                data: { status: 'VOID' },
            });
        }
        const paid = await this.prisma.commission.findMany({
            where: { biz_id: String(orderId), biz_type: 'ORDER', status: 'PAID' },
        });
        for (const c of paid) {
            await this.reversePaidCommission(c.id, 'Order refunded');
        }
        return { voided: commissions.length, reversed: paid.length };
    }
    async payoutForOrder(orderId) {
        const marked = await this.markSettledForOrder(orderId);
        const paid = await this.payoutSettledForOrder(orderId);
        return { marked, paid };
    }
    async markSettledBatch(limit) {
        const rule = await this.getActiveRule();
        const batchSize = limit ?? rule.payout_batch_size ?? 100;
        const delayDays = rule.settle_delay_days ?? 0;
        const pending = await this.prisma.commission.findMany({
            where: { status: 'PENDING', biz_type: 'ORDER' },
            take: batchSize * 3,
            orderBy: { id: 'asc' },
        });
        let marked = 0;
        const now = new Date();
        for (const c of pending) {
            if (marked >= batchSize)
                break;
            if (!(await this.isCommissionEligibleToSettle(c, delayDays, now)))
                continue;
            const updated = await this.prisma.commission.updateMany({
                where: { id: c.id, status: 'PENDING' },
                data: { status: 'SETTLED', settled_at: now },
            });
            if (updated.count > 0)
                marked += 1;
        }
        return { marked };
    }
    async markSettledForOrder(orderId) {
        const now = new Date();
        const rule = await this.getActiveRule();
        const delayDays = rule.settle_delay_days ?? 0;
        const pending = await this.prisma.commission.findMany({
            where: { biz_id: String(orderId), biz_type: 'ORDER', status: 'PENDING' },
        });
        let marked = 0;
        for (const c of pending) {
            if (!(await this.isCommissionEligibleToSettle(c, delayDays, now)))
                continue;
            const updated = await this.prisma.commission.updateMany({
                where: { id: c.id, status: 'PENDING' },
                data: { status: 'SETTLED', settled_at: now },
            });
            if (updated.count > 0)
                marked += 1;
        }
        return marked;
    }
    async isCommissionEligibleToSettle(commission, delayDays, now) {
        const orderId = Number(commission.biz_id);
        if (!Number.isFinite(orderId))
            return false;
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.status !== 'SETTLED')
            return false;
        if (delayDays > 0 && order.end_date) {
            const eligibleAt = new Date(order.end_date.getTime() + delayDays * 86400000);
            if (now < eligibleAt)
                return false;
        }
        return true;
    }
    async payoutSettledBatch(limit) {
        const rule = await this.getActiveRule();
        const batchSize = limit ?? rule.payout_batch_size ?? 100;
        const rows = await this.prisma.commission.findMany({
            where: { status: 'SETTLED' },
            take: batchSize,
            orderBy: { id: 'asc' },
        });
        let paid = 0;
        for (const c of rows) {
            const ok = await this.payoutOne(c.id);
            if (ok)
                paid += 1;
        }
        return { paid };
    }
    async payoutSettledForOrder(orderId) {
        const rows = await this.prisma.commission.findMany({
            where: { biz_id: String(orderId), biz_type: 'ORDER', status: 'SETTLED' },
        });
        let paid = 0;
        for (const c of rows) {
            const ok = await this.payoutOne(c.id);
            if (ok)
                paid += 1;
        }
        return paid;
    }
    async runSettlementCycle() {
        const settled = await this.markSettledBatch();
        const paid = await this.payoutSettledBatch();
        return { settled: settled.marked, paid: paid.paid };
    }
    async payoutOne(commissionId) {
        try {
            await this.prisma.$transaction(async (tx) => {
                const c = await tx.commission.findUnique({ where: { id: commissionId } });
                if (!c || c.status !== 'SETTLED') {
                    return;
                }
                const amount = (0, mapper_1.decimalToNumber)(c.amount);
                let wallet = await tx.wallet.findUnique({
                    where: { user_id_type: { user_id: c.to_user_id, type: 'BALANCE' } },
                });
                if (!wallet) {
                    wallet = await tx.wallet.create({
                        data: { user_id: c.to_user_id, type: 'BALANCE' },
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
                        user_id: c.to_user_id,
                        type: 'CREDIT',
                        wallet_type: 'BALANCE',
                        reference_id: String(c.id),
                        reference_type: 'COMMISSION',
                        amount: new library_1.Decimal(amount),
                        balance_before: new library_1.Decimal(before),
                        balance_after: new library_1.Decimal(after),
                        description: `Commission from order ${c.biz_id}`,
                    },
                });
                const now = new Date();
                await tx.commission.update({
                    where: { id: c.id },
                    data: { status: 'PAID', paid_at: now },
                });
            });
            return true;
        }
        catch (e) {
            this.logger.warn(`Payout commission ${commissionId} failed: ${e}`);
            return false;
        }
    }
    async reversePaidCommission(commissionId, reason) {
        await this.prisma.$transaction(async (tx) => {
            const c = await tx.commission.findUnique({ where: { id: commissionId } });
            if (!c || c.status !== 'PAID')
                return;
            const amount = (0, mapper_1.decimalToNumber)(c.amount);
            const wallet = await tx.wallet.findUnique({
                where: { user_id_type: { user_id: c.to_user_id, type: 'BALANCE' } },
            });
            if (wallet) {
                const before = (0, mapper_1.decimalToNumber)(wallet.balance_available);
                const after = Math.max(0, before - amount);
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance_available: new library_1.Decimal(after), version: { increment: 1 } },
                });
                await tx.walletLog.create({
                    data: {
                        wallet_id: wallet.id,
                        user_id: c.to_user_id,
                        type: 'DEBIT',
                        wallet_type: 'BALANCE',
                        reference_id: String(c.id),
                        reference_type: 'COMMISSION_REVERSE',
                        amount: new library_1.Decimal(-amount),
                        balance_before: new library_1.Decimal(before),
                        balance_after: new library_1.Decimal(after),
                        description: reason,
                    },
                });
            }
            await tx.commission.create({
                data: {
                    biz_type: 'ORDER',
                    biz_id: c.biz_id,
                    from_user_id: c.from_user_id,
                    to_user_id: c.to_user_id,
                    relation_level: c.relation_level,
                    amount: new library_1.Decimal(-amount),
                    status: 'VOID',
                    manual_flag: true,
                    reverse_of: c.id,
                    rule_snapshot: JSON.stringify({ reason, reversed_at: new Date().toISOString() }),
                },
            });
        });
    }
    mapAdminListItem(c) {
        return {
            id: c.id,
            user_id: c.to_user_id,
            amount: c.amount,
            source_order_id: c.biz_id,
            from_user_id: c.from_user_id,
            status: c.status,
            type: (0, commission_config_1.commissionTypeByLevel)(c.relation_level),
            created_at: c.created_at,
        };
    }
    async listAdmin(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
            ...(params.user_id ? { to_user_id: params.user_id } : {}),
            ...(params.status ? { status: params.status } : {}),
            ...(params.type === 'DIRECT' ? { relation_level: 1 } : {}),
            ...(params.type === 'TEAM' ? { relation_level: { gt: 1 } } : {}),
        };
        const [total, records] = await Promise.all([
            this.prisma.commission.count({ where }),
            this.prisma.commission.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        return {
            total,
            list: records.map((r) => this.mapAdminListItem((0, mapper_1.mapCommission)(r))),
        };
    }
    async getAdmin(id) {
        const c = await this.prisma.commission.findUnique({ where: { id } });
        if (!c) {
            throw new business_exception_1.BusinessException('COMMISSION_NOT_FOUND', 'Commission not found', common_1.HttpStatus.NOT_FOUND);
        }
        const mapped = (0, mapper_1.mapCommission)(c);
        return {
            ...this.mapAdminListItem(mapped),
            rule_snapshot: mapped.rule_snapshot,
            manual_flag: mapped.manual_flag,
        };
    }
    async freeze(id, reason) {
        const c = await this.prisma.commission.findUnique({ where: { id } });
        if (!c || !['PENDING', 'SETTLED'].includes(c.status)) {
            throw new business_exception_1.BusinessException('INVALID_STATUS', 'Cannot freeze', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.commission.update({ where: { id }, data: { status: 'FROZEN' } });
        return { status: 'success', reason };
    }
    async unfreeze(id, reason) {
        const c = await this.prisma.commission.findUnique({ where: { id } });
        if (!c || c.status !== 'FROZEN') {
            throw new business_exception_1.BusinessException('INVALID_STATUS', 'Cannot unfreeze', common_1.HttpStatus.BAD_REQUEST);
        }
        const nextStatus = c.settled_at ? 'SETTLED' : 'PENDING';
        await this.prisma.commission.update({ where: { id }, data: { status: nextStatus } });
        return { status: 'success', reason };
    }
    async void(id, reason) {
        const c = await this.prisma.commission.findUnique({ where: { id } });
        if (!c || c.status === 'VOID' || c.status === 'PAID') {
            throw new business_exception_1.BusinessException('INVALID_STATUS', 'Cannot void', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.commission.update({
            where: { id },
            data: { status: 'VOID', rule_snapshot: JSON.stringify({ void_reason: reason }) },
        });
        return { status: 'success' };
    }
    async manualCredit(dto) {
        const bizId = `MANUAL_${Date.now()}`;
        const c = await this.prisma.commission.create({
            data: {
                biz_type: 'MANUAL',
                biz_id: bizId,
                from_user_id: dto.user_id,
                to_user_id: dto.user_id,
                relation_level: 0,
                amount: new library_1.Decimal(dto.amount),
                status: 'PENDING',
                manual_flag: true,
                rule_snapshot: JSON.stringify({ reason: dto.reason }),
            },
        });
        await this.prisma.commission.update({
            where: { id: c.id },
            data: { status: 'SETTLED', settled_at: new Date() },
        });
        await this.payoutOne(c.id);
        return { status: 'success' };
    }
    async manualReverse(dto) {
        const bizId = bizIdRef();
        await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { user_id_type: { user_id: dto.user_id, type: 'BALANCE' } },
            });
            if (!wallet) {
                throw new business_exception_1.BusinessException('WALLET_NOT_FOUND', 'Wallet not found', common_1.HttpStatus.NOT_FOUND);
            }
            const before = (0, mapper_1.decimalToNumber)(wallet.balance_available);
            if (before < dto.amount) {
                throw new business_exception_1.BusinessException('INSUFFICIENT_BALANCE', 'Insufficient balance', common_1.HttpStatus.BAD_REQUEST);
            }
            const after = before - dto.amount;
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance_available: new library_1.Decimal(after), version: { increment: 1 } },
            });
            await tx.walletLog.create({
                data: {
                    wallet_id: wallet.id,
                    user_id: dto.user_id,
                    type: 'DEBIT',
                    wallet_type: 'BALANCE',
                    reference_id: bizId,
                    reference_type: 'COMMISSION_REVERSE',
                    amount: new library_1.Decimal(-dto.amount),
                    balance_before: new library_1.Decimal(before),
                    balance_after: new library_1.Decimal(after),
                    description: dto.reason,
                },
            });
            await tx.commission.create({
                data: {
                    biz_type: 'MANUAL',
                    biz_id: bizId,
                    from_user_id: dto.user_id,
                    to_user_id: dto.user_id,
                    relation_level: 0,
                    amount: new library_1.Decimal(-dto.amount),
                    status: 'VOID',
                    manual_flag: true,
                    rule_snapshot: JSON.stringify({ reason: dto.reason }),
                },
            });
        });
        return { status: 'success' };
    }
    async publishRule(dto) {
        let parsed;
        try {
            parsed = { ...commission_config_1.DEFAULT_COMMISSION_RULE, ...JSON.parse(dto.config) };
        }
        catch {
            throw new business_exception_1.BusinessException('INVALID_CONFIG', 'Invalid JSON config', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.commissionRule.updateMany({ where: { status: 'ACTIVE' }, data: { status: 'ARCHIVED' } });
        const version = `v${Date.now()}`;
        await this.prisma.commissionRule.create({
            data: {
                name: dto.name,
                version,
                config: JSON.stringify(parsed),
                status: 'ACTIVE',
                published_at: new Date(),
            },
        });
        return { status: 'success', version };
    }
    async listRules() {
        const rules = await this.prisma.commissionRule.findMany({
            orderBy: { id: 'desc' },
            take: 50,
        });
        return rules.map((r) => ({
            id: r.id,
            name: r.name,
            version: r.version,
            config: r.config,
            status: r.status,
            published_at: r.published_at?.toISOString(),
            created_at: r.created_at.toISOString(),
        }));
    }
    async getActiveRuleDetail() {
        const rule = await this.prisma.commissionRule.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { id: 'desc' },
        });
        if (!rule) {
            return { ...commission_config_1.DEFAULT_COMMISSION_RULE, name: '默认规则', version: 'default', status: 'ACTIVE' };
        }
        let config;
        try {
            config = { ...commission_config_1.DEFAULT_COMMISSION_RULE, ...JSON.parse(rule.config) };
        }
        catch {
            config = commission_config_1.DEFAULT_COMMISSION_RULE;
        }
        return {
            id: rule.id,
            name: rule.name,
            version: rule.version,
            config: JSON.stringify(config, null, 2),
            status: rule.status,
            published_at: rule.published_at?.toISOString(),
        };
    }
};
exports.CommissionService = CommissionService;
exports.CommissionService = CommissionService = CommissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionService);
function bizIdRef() {
    return `MANUAL_${Date.now()}`;
}
//# sourceMappingURL=commission.service.js.map