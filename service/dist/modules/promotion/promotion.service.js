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
exports.PromotionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const mapper_1 = require("../../common/utils/mapper");
const invite_progress_service_1 = require("./invite-progress.service");
const promotion_utils_1 = require("./promotion.utils");
let PromotionService = class PromotionService {
    prisma;
    config;
    inviteProgress;
    constructor(prisma, config, inviteProgress) {
        this.prisma = prisma;
        this.config = config;
        this.inviteProgress = inviteProgress;
    }
    async getSummary(userId) {
        const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
        if (!link) {
            throw new business_exception_1.BusinessException('PROMO_NOT_FOUND', 'Promotion link not found', common_1.HttpStatus.NOT_FOUND);
        }
        const relation = await this.prisma.userRelation.findUnique({ where: { user_id: userId } });
        const levelCounts = await this.getLevelCounts(userId);
        const directCount = levelCounts.l1_count;
        const teamCount = Object.values(levelCounts).reduce((a, b) => a + b, 0);
        const commissionAgg = await this.prisma.commission.aggregate({
            where: { to_user_id: userId },
            _sum: { amount: true },
        });
        const inviteUnlock = await this.inviteProgress.getProgress(userId);
        const atMaxLevel = (relation?.level ?? 0) >= promotion_utils_1.MAX_PROMO_LEVEL;
        const linkDisabled = atMaxLevel || link.status !== 'ACTIVE';
        const h5Base = this.config.get('H5_BASE_URL') || 'http://localhost:5174';
        const shareUrl = linkDisabled ? '' : `${h5Base}/#/pages/register/index?ref=${link.invite_code}`;
        return {
            invite_code: link.invite_code,
            share_url: shareUrl,
            link_status: linkDisabled ? 'DISABLED' : 'ACTIVE',
            promo_level: relation?.level ?? 0,
            direct_count: directCount,
            team_count: teamCount,
            commission_total: (0, mapper_1.decimalToNumber)(commissionAgg._sum.amount),
            level_counts: levelCounts,
            invite_unlock: inviteUnlock,
        };
    }
    async getLevelCounts(userId) {
        const counts = {
            l1_count: 0,
            l2_count: 0,
            l3_count: 0,
            l4_count: 0,
            l5_count: 0,
        };
        const relations = await this.prisma.userRelation.findMany({
            where: {
                OR: [{ parent_user_id: userId }, { path: { startsWith: `${userId}/` } }],
            },
        });
        for (const rel of relations) {
            const lv = (0, promotion_utils_1.getRelativeLevel)(rel.path, rel.parent_user_id, userId);
            if (!lv || lv > promotion_utils_1.MAX_PROMO_LEVEL)
                continue;
            const key = `l${lv}_count`;
            counts[key] += 1;
        }
        return counts;
    }
    async listDownlines(userId, params) {
        const targetLevel = Math.min(promotion_utils_1.MAX_PROMO_LEVEL, Math.max(1, Number(params.level) || 1));
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const relations = await this.prisma.userRelation.findMany({
            where: {
                OR: [{ parent_user_id: userId }, { path: { startsWith: `${userId}/` } }],
            },
            include: { user: true },
            orderBy: { id: 'desc' },
        });
        const matched = relations.filter((rel) => (0, promotion_utils_1.getRelativeLevel)(rel.path, rel.parent_user_id, userId) === targetLevel);
        const total = matched.length;
        const slice = matched.slice((page - 1) * pageSize, page * pageSize);
        const userIds = slice.map((r) => r.user_id);
        const orderAggs = userIds.length
            ? await this.prisma.order.groupBy({
                by: ['user_id'],
                where: {
                    user_id: { in: userIds },
                    status: { in: ['ACTIVE', 'SETTLED', 'PAID'] },
                },
                _sum: { amount: true },
                _count: { id: true },
            })
            : [];
        const investMap = new Map(orderAggs.map((a) => [a.user_id, { amount: (0, mapper_1.decimalToNumber)(a._sum.amount), count: a._count.id }]));
        const records = slice.map((rel) => {
            const invest = investMap.get(rel.user_id);
            return {
                user_id: rel.user_id,
                username: (0, promotion_utils_1.maskUsername)(rel.user.username),
                level: targetLevel,
                promo_level: rel.level,
                invest_amount: invest?.amount ?? 0,
                order_count: invest?.count ?? 0,
                joined_at: rel.created_at.toISOString(),
            };
        });
        return (0, mapper_1.pageResult)(records, total);
    }
    async listCommissions(userId, params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
            to_user_id: userId,
            ...(params.status ? { status: params.status } : {}),
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
        return (0, mapper_1.pageResult)(records.map(mapper_1.mapCommission), total);
    }
    async getCommissionSummary(userId) {
        const groups = await this.prisma.commission.groupBy({
            by: ['status'],
            where: { to_user_id: userId },
            _sum: { amount: true },
        });
        const summary = {
            pending: 0,
            settled: 0,
            paid: 0,
            total: 0,
        };
        for (const g of groups) {
            const amt = (0, mapper_1.decimalToNumber)(g._sum.amount);
            summary.total += amt;
            if (g.status === 'PENDING')
                summary.pending = amt;
            else if (g.status === 'SETTLED')
                summary.settled = amt;
            else if (g.status === 'PAID')
                summary.paid = amt;
        }
        return summary;
    }
    async getAdminUserDetail(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new business_exception_1.BusinessException('USER_NOT_FOUND', 'User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const levelCounts = await this.getLevelCounts(userId);
        const downlines = {
            level_1: [],
            level_2: [],
            level_3: [],
        };
        for (const lv of [1, 2, 3]) {
            const res = await this.listDownlines(userId, { level: lv, page: 1, page_size: 20 });
            downlines[`level_${lv}`] = res.records.map((r) => ({
                user_id: r.user_id,
                username: r.username,
            }));
        }
        const relation = await this.prisma.userRelation.findUnique({ where: { user_id: userId } });
        const uplines = [];
        if (relation) {
            const ancestorIds = relation.path.split('/').filter(Boolean).map(Number);
            if (ancestorIds.length) {
                const users = await this.prisma.user.findMany({ where: { id: { in: ancestorIds } } });
                const userMap = new Map(users.map((u) => [u.id, u.username]));
                for (const id of ancestorIds) {
                    uplines.push({ user_id: id, username: userMap.get(id) ?? `用户${id}` });
                }
            }
        }
        return {
            user: {
                user_id: user.id,
                username: user.username,
                phone_number: user.phone_number ?? undefined,
                email: user.email ?? undefined,
                status: user.status,
                created_at: user.created_at.toISOString(),
                promo_summary: levelCounts,
            },
            uplines,
            downlines,
        };
    }
    async adjustPromoRelation(adminId, userId, newParentUserId, reason) {
        if (newParentUserId === userId) {
            throw new business_exception_1.BusinessException(business_exception_1.PromoErrors.CYCLE_DETECTED, 'Cannot set self as parent', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new business_exception_1.BusinessException(business_exception_1.UserErrors.USER_NOT_FOUND, 'User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const newParent = await tx.user.findUnique({ where: { id: newParentUserId } });
            if (!newParent) {
                throw new business_exception_1.BusinessException(business_exception_1.PromoErrors.INVALID_PARENT, 'Invalid parent user', common_1.HttpStatus.BAD_REQUEST);
            }
            const parentRelation = await tx.userRelation.findUnique({ where: { user_id: newParentUserId } });
            if (parentRelation && (0, promotion_utils_1.containsPath)(parentRelation.path, userId)) {
                throw new business_exception_1.BusinessException(business_exception_1.PromoErrors.CYCLE_DETECTED, 'Cycle detected', common_1.HttpStatus.BAD_REQUEST);
            }
            const newPath = parentRelation
                ? `${parentRelation.path}/${newParentUserId}`
                : String(newParentUserId);
            const newLevel = parentRelation ? parentRelation.level + 1 : 1;
            if (newLevel > promotion_utils_1.MAX_PROMO_LEVEL) {
                throw new business_exception_1.BusinessException(business_exception_1.PromoErrors.LEVEL_EXCEEDED, 'Promotion level exceeded', common_1.HttpStatus.BAD_REQUEST);
            }
            const oldRelation = await tx.userRelation.findUnique({ where: { user_id: userId } });
            const oldPath = oldRelation?.path ?? '';
            const oldPrefix = oldPath ? `${oldPath}/${userId}` : String(userId);
            const newPrefix = `${newPath}/${userId}`;
            const relationData = {
                parent_user_id: newParentUserId,
                path: newPath,
                level: newLevel,
            };
            if (oldRelation) {
                await tx.userRelation.update({ where: { user_id: userId }, data: relationData });
            }
            else {
                await tx.userRelation.create({ data: { user_id: userId, ...relationData } });
            }
            if (oldRelation && oldPrefix !== newPrefix) {
                const descendants = await tx.userRelation.findMany({
                    where: {
                        OR: [{ path: oldPrefix }, { path: { startsWith: `${oldPrefix}/` } }],
                    },
                });
                for (const rel of descendants) {
                    const suffix = rel.path === oldPrefix ? '' : rel.path.slice(oldPrefix.length);
                    const updatedPath = `${newPrefix}${suffix}`;
                    await tx.userRelation.update({
                        where: { id: rel.id },
                        data: {
                            path: updatedPath,
                            level: Math.min((0, promotion_utils_1.levelFromPath)(updatedPath), promotion_utils_1.MAX_PROMO_LEVEL),
                        },
                    });
                }
            }
            await tx.auditLog.create({
                data: {
                    admin_id: adminId,
                    action: 'PROMO_ADJUST',
                    target_type: 'USER',
                    target_id: userId,
                    reason,
                    before_data: oldRelation ? JSON.stringify(oldRelation) : null,
                    after_data: JSON.stringify({ ...relationData, user_id: userId }),
                },
            });
            return { status: 'success' };
        });
    }
    generateInviteCode() {
        return (0, crypto_1.randomBytes)(4).toString('hex').toUpperCase();
    }
    computeAuditStatus(linkStatus, directCount, totalSales) {
        if (linkStatus === 'DISABLED')
            return 2;
        if (directCount === 0 && totalSales === 0)
            return 0;
        return 1;
    }
    async getDownlineUserIds(userId) {
        const relations = await this.prisma.userRelation.findMany({
            where: {
                OR: [{ parent_user_id: userId }, { path: { startsWith: `${userId}/` } }],
            },
            select: { user_id: true },
        });
        return relations.map((r) => r.user_id);
    }
    async getDownlineSalesTotal(userId) {
        const ids = await this.getDownlineUserIds(userId);
        if (!ids.length)
            return 0;
        const agg = await this.prisma.order.aggregate({
            where: {
                user_id: { in: ids },
                status: { in: ['ACTIVE', 'SETTLED', 'PAID'] },
            },
            _sum: { amount: true },
        });
        return (0, mapper_1.decimalToNumber)(agg._sum.amount);
    }
    async buildDistributorProfile(userId, link) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const relation = await this.prisma.userRelation.findUnique({ where: { user_id: userId } });
        const levelCounts = await this.getLevelCounts(userId);
        const [commissionAgg, totalSales] = await Promise.all([
            this.prisma.commission.aggregate({
                where: { to_user_id: userId },
                _sum: { amount: true },
            }),
            this.getDownlineSalesTotal(userId),
        ]);
        return {
            user_id: userId,
            username: user?.username,
            level_id: Math.min(Math.max(relation?.level ?? 1, 1), 3),
            audit_status: this.computeAuditStatus(link.status, levelCounts.l1_count, totalSales),
            total_commission: (0, mapper_1.decimalToNumber)(commissionAgg._sum.amount),
            total_sales: totalSales,
            join_time: link.created_at.toISOString(),
        };
    }
    async listDistributors(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const links = await this.prisma.promotionLink.findMany({
            include: { user: true },
            orderBy: { id: 'desc' },
        });
        const profiles = await Promise.all(links.map((link) => this.buildDistributorProfile(link.user_id, link)));
        let filtered = profiles;
        if (params.level_id != null) {
            filtered = filtered.filter((p) => p.level_id === Number(params.level_id));
        }
        if (params.audit_status != null) {
            filtered = filtered.filter((p) => p.audit_status === Number(params.audit_status));
        }
        const total = filtered.length;
        const list = filtered.slice((page - 1) * pageSize, page * pageSize);
        return { total, list };
    }
    async getDistributorDetail(userId) {
        const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
        if (!link) {
            throw new business_exception_1.BusinessException('PROMO_NOT_FOUND', 'Distributor not found', common_1.HttpStatus.NOT_FOUND);
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new business_exception_1.BusinessException('USER_NOT_FOUND', 'User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const profile = await this.buildDistributorProfile(userId, link);
        const levelCounts = await this.getLevelCounts(userId);
        return {
            profile,
            user: {
                user_id: user.id,
                username: user.username,
                phone: user.phone_number ?? undefined,
                email: user.email ?? undefined,
            },
            team: {
                l1_count: levelCounts.l1_count,
                l2_count: levelCounts.l2_count,
                l3_count: levelCounts.l3_count,
            },
        };
    }
    async auditDistributor(adminId, userId, status, reason) {
        const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
        if (!link) {
            throw new business_exception_1.BusinessException('PROMO_NOT_FOUND', 'Distributor not found', common_1.HttpStatus.NOT_FOUND);
        }
        const newStatus = status === 1 ? 'ACTIVE' : 'DISABLED';
        await this.prisma.promotionLink.update({
            where: { user_id: userId },
            data: { status: newStatus },
        });
        await this.prisma.auditLog.create({
            data: {
                admin_id: adminId,
                action: 'DISTRIBUTOR_AUDIT',
                target_type: 'USER',
                target_id: userId,
                reason,
                after_data: JSON.stringify({ audit_status: status, link_status: newStatus }),
            },
        });
        return { status: 'success' };
    }
    async updateDistributorLevel(adminId, userId, levelId, reason) {
        const relation = await this.prisma.userRelation.findUnique({ where: { user_id: userId } });
        if (!relation) {
            throw new business_exception_1.BusinessException('PROMO_NOT_FOUND', 'User has no promotion relation', common_1.HttpStatus.NOT_FOUND);
        }
        const newLevel = Math.min(promotion_utils_1.MAX_PROMO_LEVEL, Math.max(1, levelId));
        await this.prisma.userRelation.update({
            where: { user_id: userId },
            data: { level: newLevel },
        });
        await this.prisma.auditLog.create({
            data: {
                admin_id: adminId,
                action: 'DISTRIBUTOR_LEVEL',
                target_type: 'USER',
                target_id: userId,
                reason,
                before_data: JSON.stringify({ level: relation.level }),
                after_data: JSON.stringify({ level: newLevel }),
            },
        });
        return { status: 'success' };
    }
    async getUserPromoLink(userId) {
        const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
        if (!link) {
            throw new business_exception_1.BusinessException('PROMO_NOT_FOUND', 'Promotion link not found', common_1.HttpStatus.NOT_FOUND);
        }
        const h5Base = this.config.get('H5_BASE_URL') || 'http://localhost:5174';
        return {
            user_id: userId,
            invite_code: link.invite_code,
            link: `${h5Base}/#/pages/register/index?ref=${link.invite_code}`,
            status: link.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        };
    }
    async resetUserPromoLink(adminId, userId, reason) {
        const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
        if (!link) {
            throw new business_exception_1.BusinessException('PROMO_NOT_FOUND', 'Promotion link not found', common_1.HttpStatus.NOT_FOUND);
        }
        let newCode = this.generateInviteCode();
        for (let i = 0; i < 5; i++) {
            const exists = await this.prisma.promotionLink.findUnique({ where: { invite_code: newCode } });
            if (!exists)
                break;
            newCode = this.generateInviteCode();
        }
        await this.prisma.promotionLink.update({
            where: { user_id: userId },
            data: { invite_code: newCode, reset_at: new Date(), status: 'ACTIVE' },
        });
        await this.prisma.auditLog.create({
            data: {
                admin_id: adminId,
                action: 'PROMO_LINK_RESET',
                target_type: 'USER',
                target_id: userId,
                reason,
                before_data: JSON.stringify({ invite_code: link.invite_code }),
                after_data: JSON.stringify({ invite_code: newCode }),
            },
        });
        return this.getUserPromoLink(userId);
    }
    async listDistributorOrders(userId, params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const downlineIds = await this.getDownlineUserIds(userId);
        if (!downlineIds.length) {
            return { total: 0, list: [] };
        }
        const where = {
            user_id: { in: downlineIds },
            status: { in: ['ACTIVE', 'SETTLED', 'PAID'] },
        };
        const [total, orders] = await Promise.all([
            this.prisma.order.count({ where }),
            this.prisma.order.findMany({
                where,
                include: { user: true },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        const list = orders.map((o) => ({
            id: o.order_no,
            user_id: o.user_id,
            username: o.user.username,
            amount: (0, mapper_1.decimalToNumber)(o.amount),
            created_at: o.created_at.toISOString(),
        }));
        return { total, list };
    }
};
exports.PromotionService = PromotionService;
exports.PromotionService = PromotionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        invite_progress_service_1.InviteProgressService])
], PromotionService);
//# sourceMappingURL=promotion.service.js.map