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
var RiskService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const job_lock_service_1 = require("../../jobs/job-lock.service");
const mapper_1 = require("../../common/utils/mapper");
const LOCK_KEY = 'job:risk-scan';
const LOCK_TTL = 3000;
const DEFAULT_RULES = [
    {
        code: 'LARGE_WITHDRAW',
        name: '大额提现预警',
        rule_type: 'WITHDRAW_AMOUNT',
        threshold: JSON.stringify({ amount: 50000 }),
        description: '单笔提现超过阈值',
    },
    {
        code: 'RAPID_DIRECT_INVITE',
        name: '短期大量直推',
        rule_type: 'INVITE_BURST',
        threshold: JSON.stringify({ count: 5, hours: 24 }),
        description: '24小时内直推超过5人',
    },
    {
        code: 'MULTI_PENDING_WITHDRAW',
        name: '多笔待审提现',
        rule_type: 'WITHDRAW_PENDING',
        threshold: JSON.stringify({ count: 3 }),
        description: '同时存在多笔待审核提现',
    },
    {
        code: 'ABNORMAL_RECHARGE',
        name: '异常充值',
        rule_type: 'RECHARGE_AMOUNT',
        threshold: JSON.stringify({ amount: 50000, hours: 24 }),
        description: '24小时内单笔充值超过阈值',
    },
];
let RiskService = RiskService_1 = class RiskService {
    prisma;
    jobLock;
    logger = new common_1.Logger(RiskService_1.name);
    constructor(prisma, jobLock) {
        this.prisma = prisma;
        this.jobLock = jobLock;
    }
    async ensureDefaultRules() {
        for (const rule of DEFAULT_RULES) {
            await this.prisma.riskRule.upsert({
                where: { code: rule.code },
                update: {},
                create: rule,
            });
        }
    }
    async handleRiskScanCron() {
        await this.jobLock.runWithLock(LOCK_KEY, LOCK_TTL, async () => {
            const result = await this.runScan();
            if (result.created > 0) {
                this.logger.log(`Risk scan created ${result.created} events`);
            }
            return result;
        });
    }
    async runScan() {
        await this.ensureDefaultRules();
        let created = 0;
        const largeRule = await this.prisma.riskRule.findUnique({ where: { code: 'LARGE_WITHDRAW' } });
        if (largeRule?.enabled) {
            const threshold = JSON.parse(largeRule.threshold);
            const withdraws = await this.prisma.withdraw.findMany({
                where: { status: 'PENDING', amount: { gte: threshold.amount } },
            });
            for (const w of withdraws) {
                const ok = await this.createEventIfNew('LARGE_WITHDRAW', w.user_id, {
                    withdraw_id: w.id,
                    amount: (0, mapper_1.decimalToNumber)(w.amount),
                });
                if (ok)
                    created += 1;
            }
        }
        const burstRule = await this.prisma.riskRule.findUnique({ where: { code: 'RAPID_DIRECT_INVITE' } });
        if (burstRule?.enabled) {
            const threshold = JSON.parse(burstRule.threshold);
            const since = new Date(Date.now() - threshold.hours * 60 * 60 * 1000);
            const groups = await this.prisma.userRelation.groupBy({
                by: ['parent_user_id'],
                where: { created_at: { gte: since } },
                _count: { id: true },
            });
            for (const g of groups) {
                if (g._count.id >= threshold.count) {
                    const ok = await this.createEventIfNew('RAPID_DIRECT_INVITE', g.parent_user_id, {
                        invite_count: g._count.id,
                        window_hours: threshold.hours,
                    });
                    if (ok)
                        created += 1;
                }
            }
        }
        const pendingRule = await this.prisma.riskRule.findUnique({ where: { code: 'MULTI_PENDING_WITHDRAW' } });
        if (pendingRule?.enabled) {
            const threshold = JSON.parse(pendingRule.threshold);
            const groups = await this.prisma.withdraw.groupBy({
                by: ['user_id'],
                where: { status: 'PENDING' },
                _count: { id: true },
            });
            for (const g of groups) {
                if (g._count.id >= threshold.count) {
                    const ok = await this.createEventIfNew('MULTI_PENDING_WITHDRAW', g.user_id, {
                        pending_count: g._count.id,
                    });
                    if (ok)
                        created += 1;
                }
            }
        }
        const rechargeRule = await this.prisma.riskRule.findUnique({ where: { code: 'ABNORMAL_RECHARGE' } });
        if (rechargeRule?.enabled) {
            const threshold = JSON.parse(rechargeRule.threshold);
            const since = new Date(Date.now() - (threshold.hours || 24) * 60 * 60 * 1000);
            const recharges = await this.prisma.rechargeOrder.findMany({
                where: {
                    status: 'SUCCESS',
                    amount: { gte: threshold.amount },
                    created_at: { gte: since },
                },
            });
            for (const r of recharges) {
                const ok = await this.createEventIfNew('ABNORMAL_RECHARGE', r.user_id, {
                    recharge_id: r.id,
                    biz_id: r.biz_id,
                    amount: (0, mapper_1.decimalToNumber)(r.amount),
                });
                if (ok)
                    created += 1;
            }
        }
        return { created };
    }
    async createEventIfNew(ruleCode, userId, detail) {
        const existing = await this.prisma.riskEvent.findFirst({
            where: {
                rule_code: ruleCode,
                user_id: userId,
                status: 'OPEN',
                created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });
        if (existing)
            return false;
        await this.prisma.riskEvent.create({
            data: {
                rule_code: ruleCode,
                user_id: userId,
                severity: ruleCode === 'LARGE_WITHDRAW' ? 'HIGH' : 'MEDIUM',
                status: 'OPEN',
                detail: JSON.stringify(detail),
            },
        });
        return true;
    }
    async listEvents(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
            ...(params.status ? { status: params.status } : {}),
            ...(params.rule_code ? { rule_code: params.rule_code } : {}),
            ...(params.user_id ? { user_id: params.user_id } : {}),
        };
        const [total, records] = await Promise.all([
            this.prisma.riskEvent.count({ where }),
            this.prisma.riskEvent.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        return {
            total,
            list: records.map((e) => ({
                id: e.id,
                rule_code: e.rule_code,
                user_id: e.user_id,
                severity: e.severity,
                status: e.status,
                detail: e.detail,
                created_at: e.created_at.toISOString(),
            })),
        };
    }
    async listRules() {
        await this.ensureDefaultRules();
        const rules = await this.prisma.riskRule.findMany({ orderBy: { id: 'asc' } });
        return rules.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            rule_type: r.rule_type,
            threshold: r.threshold,
            enabled: r.enabled,
            description: r.description,
        }));
    }
    async resolveEvent(adminId, eventId, action, reason) {
        const event = await this.prisma.riskEvent.findUnique({ where: { id: eventId } });
        if (!event)
            return null;
        await this.prisma.$transaction(async (tx) => {
            await tx.riskEvent.update({
                where: { id: eventId },
                data: { status: 'RESOLVED' },
            });
            if (action === 'BAN_USER' && event.user_id) {
                await tx.user.update({
                    where: { id: event.user_id },
                    data: { status: 'BANNED' },
                });
            }
            else if (action === 'FREEZE_USER' && event.user_id) {
                await tx.user.update({
                    where: { id: event.user_id },
                    data: { status: 'FROZEN' },
                });
            }
            await tx.auditLog.create({
                data: {
                    admin_id: adminId,
                    action: `RISK_${action}`,
                    target_type: 'RISK_EVENT',
                    target_id: eventId,
                    reason: reason || action,
                },
            });
        });
        return { status: 'success' };
    }
    async getDashboard() {
        const [openCount, highCount, todayCount, rules] = await Promise.all([
            this.prisma.riskEvent.count({ where: { status: 'OPEN' } }),
            this.prisma.riskEvent.count({ where: { status: 'OPEN', severity: 'HIGH' } }),
            this.prisma.riskEvent.count({
                where: { created_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
            }),
            this.listRules(),
        ]);
        return {
            open_events: openCount,
            high_severity: highCount,
            today_events: todayCount,
            enabled_rules: rules.filter((r) => r.enabled).length,
        };
    }
};
exports.RiskService = RiskService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RiskService.prototype, "handleRiskScanCron", null);
exports.RiskService = RiskService = RiskService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        job_lock_service_1.JobLockService])
], RiskService);
//# sourceMappingURL=risk.service.js.map