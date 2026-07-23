import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { BusinessException, UserErrors, PromoErrors } from '../../common/exceptions/business.exception';
import { decimalToNumber, mapCommission, pageResult } from '../../common/utils/mapper';
import { InviteProgressService } from './invite-progress.service';
import { getRelativeLevel, maskUsername, MAX_PROMO_LEVEL, containsPath, levelFromPath } from './promotion.utils';

@Injectable()
export class PromotionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly inviteProgress: InviteProgressService,
  ) {}

  async getSummary(userId: number) {
    const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
    if (!link) {
      throw new BusinessException('PROMO_NOT_FOUND', 'Promotion link not found', HttpStatus.NOT_FOUND);
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
    const atMaxLevel = (relation?.level ?? 0) >= MAX_PROMO_LEVEL;
    const linkDisabled = atMaxLevel || link.status !== 'ACTIVE';

    const h5Base = this.config.get<string>('H5_BASE_URL') || 'http://localhost:5174';
    const shareUrl = linkDisabled ? '' : `${h5Base}/#/pages/register/index?ref=${link.invite_code}`;

    return {
      invite_code: link.invite_code,
      share_url: shareUrl,
      link_status: linkDisabled ? 'DISABLED' : 'ACTIVE',
      promo_level: relation?.level ?? 0,
      direct_count: directCount,
      team_count: teamCount,
      commission_total: decimalToNumber(commissionAgg._sum.amount),
      level_counts: levelCounts,
      invite_unlock: inviteUnlock,
    };
  }

  async getLevelCounts(userId: number) {
    const counts: Record<string, number> = {
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
      const lv = getRelativeLevel(rel.path, rel.parent_user_id, userId);
      if (!lv || lv > MAX_PROMO_LEVEL) continue;
      const key = `l${lv}_count` as keyof typeof counts;
      counts[key] += 1;
    }
    return counts;
  }

  async listDownlines(
    userId: number,
    params: { level?: number; page?: number; page_size?: number },
  ) {
    const targetLevel = Math.min(MAX_PROMO_LEVEL, Math.max(1, Number(params.level) || 1));
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));

    const relations = await this.prisma.userRelation.findMany({
      where: {
        OR: [{ parent_user_id: userId }, { path: { startsWith: `${userId}/` } }],
      },
      include: { user: true },
      orderBy: { id: 'desc' },
    });

    const matched = relations.filter(
      (rel) => getRelativeLevel(rel.path, rel.parent_user_id, userId) === targetLevel,
    );
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
    const investMap = new Map(
      orderAggs.map((a) => [a.user_id, { amount: decimalToNumber(a._sum.amount), count: a._count.id }]),
    );

    const records = slice.map((rel) => {
      const invest = investMap.get(rel.user_id);
      return {
        user_id: rel.user_id,
        username: maskUsername(rel.user.username),
        level: targetLevel,
        promo_level: rel.level,
        invest_amount: invest?.amount ?? 0,
        order_count: invest?.count ?? 0,
        joined_at: rel.created_at.toISOString(),
      };
    });

    return pageResult(records, total);
  }

  async listCommissions(userId: number, params: { page?: number; page_size?: number; status?: string }) {
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
    return pageResult(records.map(mapCommission), total);
  }

  async getCommissionSummary(userId: number) {
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
      const amt = decimalToNumber(g._sum.amount);
      summary.total += amt;
      if (g.status === 'PENDING') summary.pending = amt;
      else if (g.status === 'SETTLED') summary.settled = amt;
      else if (g.status === 'PAID') summary.paid = amt;
    }
    return summary;
  }

  async getAdminUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BusinessException('USER_NOT_FOUND', 'User not found', HttpStatus.NOT_FOUND);
    }
    const levelCounts = await this.getLevelCounts(userId);
    const downlines: Record<string, { user_id: number; username: string }[]> = {
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
    const uplines: { user_id: number; username: string }[] = [];
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

  async adjustPromoRelation(
    adminId: number,
    userId: number,
    newParentUserId: number,
    reason: string,
  ) {
    if (newParentUserId === userId) {
      throw new BusinessException(PromoErrors.CYCLE_DETECTED, 'Cannot set self as parent', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new BusinessException(UserErrors.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
      }

      const newParent = await tx.user.findUnique({ where: { id: newParentUserId } });
      if (!newParent) {
        throw new BusinessException(PromoErrors.INVALID_PARENT, 'Invalid parent user', HttpStatus.BAD_REQUEST);
      }

      const parentRelation = await tx.userRelation.findUnique({ where: { user_id: newParentUserId } });
      if (parentRelation && containsPath(parentRelation.path, userId)) {
        throw new BusinessException(PromoErrors.CYCLE_DETECTED, 'Cycle detected', HttpStatus.BAD_REQUEST);
      }

      const newPath = parentRelation
        ? `${parentRelation.path}/${newParentUserId}`
        : String(newParentUserId);
      const newLevel = parentRelation ? parentRelation.level + 1 : 1;
      if (newLevel > MAX_PROMO_LEVEL) {
        throw new BusinessException(PromoErrors.LEVEL_EXCEEDED, 'Promotion level exceeded', HttpStatus.BAD_REQUEST);
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
      } else {
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
              level: Math.min(levelFromPath(updatedPath), MAX_PROMO_LEVEL),
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

  private generateInviteCode() {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  /** ---- Admin distributor / promo link ---- */

  private computeAuditStatus(
    linkStatus: string,
    directCount: number,
    totalSales: number,
  ): 0 | 1 | 2 {
    if (linkStatus === 'DISABLED') return 2;
    if (directCount === 0 && totalSales === 0) return 0;
    return 1;
  }

  private async getDownlineUserIds(userId: number): Promise<number[]> {
    const relations = await this.prisma.userRelation.findMany({
      where: {
        OR: [{ parent_user_id: userId }, { path: { startsWith: `${userId}/` } }],
      },
      select: { user_id: true },
    });
    return relations.map((r) => r.user_id);
  }

  private async getDownlineSalesTotal(userId: number): Promise<number> {
    const ids = await this.getDownlineUserIds(userId);
    if (!ids.length) return 0;
    const agg = await this.prisma.order.aggregate({
      where: {
        user_id: { in: ids },
        status: { in: ['ACTIVE', 'SETTLED', 'PAID'] },
      },
      _sum: { amount: true },
    });
    return decimalToNumber(agg._sum.amount);
  }

  private async buildDistributorProfile(userId: number, link: { status: string; created_at: Date }) {
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
      total_commission: decimalToNumber(commissionAgg._sum.amount),
      total_sales: totalSales,
      join_time: link.created_at.toISOString(),
    };
  }

  async listDistributors(params: {
    page?: number;
    page_size?: number;
    level_id?: number;
    audit_status?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));

    const links = await this.prisma.promotionLink.findMany({
      include: { user: true },
      orderBy: { id: 'desc' },
    });

    const profiles = await Promise.all(
      links.map((link) => this.buildDistributorProfile(link.user_id, link)),
    );

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

  async getDistributorDetail(userId: number) {
    const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
    if (!link) {
      throw new BusinessException('PROMO_NOT_FOUND', 'Distributor not found', HttpStatus.NOT_FOUND);
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BusinessException('USER_NOT_FOUND', 'User not found', HttpStatus.NOT_FOUND);
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

  async auditDistributor(adminId: number, userId: number, status: 1 | 2, reason: string) {
    const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
    if (!link) {
      throw new BusinessException('PROMO_NOT_FOUND', 'Distributor not found', HttpStatus.NOT_FOUND);
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

  async updateDistributorLevel(adminId: number, userId: number, levelId: number, reason: string) {
    const relation = await this.prisma.userRelation.findUnique({ where: { user_id: userId } });
    if (!relation) {
      throw new BusinessException('PROMO_NOT_FOUND', 'User has no promotion relation', HttpStatus.NOT_FOUND);
    }
    const newLevel = Math.min(MAX_PROMO_LEVEL, Math.max(1, levelId));
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

  async getUserPromoLink(userId: number) {
    const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
    if (!link) {
      throw new BusinessException('PROMO_NOT_FOUND', 'Promotion link not found', HttpStatus.NOT_FOUND);
    }
    const h5Base = this.config.get<string>('H5_BASE_URL') || 'http://localhost:5174';
    return {
      user_id: userId,
      invite_code: link.invite_code,
      link: `${h5Base}/#/pages/register/index?ref=${link.invite_code}`,
      status: link.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
    };
  }

  async resetUserPromoLink(adminId: number, userId: number, reason: string) {
    const link = await this.prisma.promotionLink.findUnique({ where: { user_id: userId } });
    if (!link) {
      throw new BusinessException('PROMO_NOT_FOUND', 'Promotion link not found', HttpStatus.NOT_FOUND);
    }
    let newCode = this.generateInviteCode();
    for (let i = 0; i < 5; i++) {
      const exists = await this.prisma.promotionLink.findUnique({ where: { invite_code: newCode } });
      if (!exists) break;
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

  async listDistributorOrders(
    userId: number,
    params: { page?: number; page_size?: number },
  ) {
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
      amount: decimalToNumber(o.amount),
      created_at: o.created_at.toISOString(),
    }));
    return { total, list };
  }
}
