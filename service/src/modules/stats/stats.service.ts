import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalToNumber } from '../../common/utils/mapper';
import { BusinessException } from '../../common/exceptions/business.exception';
import { buildSeries, parseDateRange, type StatsQuery } from './stats.utils';
import { getExportTask, saveExportTask, toCsv } from './stats-export.store';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(params: StatsQuery) {
    const { from, to, granularity } = parseDateRange(params);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [newUsersToday, usersInRange, ordersInRange, withdrawsInRange, commissionsInRange] =
      await Promise.all([
        this.prisma.user.count({ where: { created_at: { gte: todayStart } } }),
        this.prisma.user.findMany({
          where: { created_at: { gte: from, lte: to } },
          select: { created_at: true },
        }),
        this.prisma.order.findMany({
          where: {
            created_at: { gte: from, lte: to },
            status: { in: ['ACTIVE', 'SETTLED', 'PAID'] },
          },
          select: { created_at: true, amount: true },
        }),
        this.prisma.withdraw.findMany({
          where: {
            created_at: { gte: from, lte: to },
            status: { in: ['PAID', 'APPROVED'] },
          },
          select: { created_at: true, amount: true },
        }),
        this.prisma.commission.findMany({
          where: {
            paid_at: { gte: from, lte: to },
            status: 'PAID',
          },
          select: { paid_at: true, amount: true },
        }),
      ]);

    const investTotal = await this.prisma.order.aggregate({
      where: { status: { in: ['ACTIVE', 'SETTLED', 'PAID'] } },
      _sum: { amount: true },
    });
    const withdrawTotal = await this.prisma.withdraw.aggregate({
      where: { status: { in: ['PAID', 'APPROVED'] } },
      _sum: { amount: true },
    });
    const commissionTotal = await this.prisma.commission.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      cards: {
        new_users: newUsersToday,
        invest_amount: decimalToNumber(investTotal._sum.amount),
        withdraw_success_amount: decimalToNumber(withdrawTotal._sum.amount),
        commission_paid: decimalToNumber(commissionTotal._sum.amount),
      },
      new_users_series: buildSeries(
        usersInRange,
        (u) => u.created_at,
        () => 1,
        from,
        to,
        granularity,
      ),
      invest_amount_series: buildSeries(
        ordersInRange,
        (o) => o.created_at,
        (o) => decimalToNumber(o.amount),
        from,
        to,
        granularity,
      ),
    };
  }

  async userGrowth(params: StatsQuery) {
    const { from, to, granularity } = parseDateRange(params);
    const users = await this.prisma.user.findMany({
      where: { created_at: { gte: from, lte: to } },
      select: { created_at: true },
    });
    return {
      series: buildSeries(users, (u) => u.created_at, () => 1, from, to, granularity),
    };
  }

  async userConversion(_params: StatsQuery) {
    const totalUsers = await this.prisma.user.count();
    const firstInvestUsers = await this.prisma.validInvite.count();
    const rate = totalUsers > 0 ? firstInvestUsers / totalUsers : 0;
    return {
      new_users: totalUsers,
      first_invest_users: firstInvestUsers,
      conversion_rate: Math.round(rate * 10000) / 10000,
    };
  }

  async promoSummary(params: StatsQuery) {
    const { from, to, granularity } = parseDateRange(params);
    const relations = await this.prisma.userRelation.findMany({
      where: { created_at: { gte: from, lte: to } },
      select: { created_at: true, level: true },
    });
    const l1 = relations.filter((r) => r.level === 1);
    const l2 = relations.filter((r) => r.level === 2);
    const l3 = relations.filter((r) => r.level === 3);
    return {
      l1_series: buildSeries(l1, (r) => r.created_at, () => 1, from, to, granularity),
      l2_series: buildSeries(l2, (r) => r.created_at, () => 1, from, to, granularity),
      l3_series: buildSeries(l3, (r) => r.created_at, () => 1, from, to, granularity),
    };
  }

  async promoTop(params: { by?: string; limit?: number }) {
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 10));
    const by = params.by || 'invite_count';

    if (by === 'team_invest') {
      const orders = await this.prisma.order.groupBy({
        by: ['user_id'],
        where: { status: { in: ['ACTIVE', 'SETTLED', 'PAID'] } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: limit,
      });
      const users = await this.prisma.user.findMany({
        where: { id: { in: orders.map((o) => o.user_id) } },
      });
      const userMap = new Map(users.map((u) => [u.id, u.username]));
      return orders.map((o) => ({
        user_id: o.user_id,
        username: userMap.get(o.user_id) || `用户${o.user_id}`,
        team_invest: decimalToNumber(o._sum.amount),
      }));
    }

    if (by === 'team_commission') {
      const rows = await this.prisma.commission.groupBy({
        by: ['to_user_id'],
        where: { status: 'PAID' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: limit,
      });
      const users = await this.prisma.user.findMany({
        where: { id: { in: rows.map((r) => r.to_user_id) } },
      });
      const userMap = new Map(users.map((u) => [u.id, u.username]));
      return rows.map((r) => ({
        user_id: r.to_user_id,
        username: userMap.get(r.to_user_id) || `用户${r.to_user_id}`,
        team_commission: decimalToNumber(r._sum.amount),
      }));
    }

    const rows = await this.prisma.userRelation.groupBy({
      by: ['parent_user_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });
    const users = await this.prisma.user.findMany({
      where: { id: { in: rows.map((r) => r.parent_user_id) } },
    });
    const userMap = new Map(users.map((u) => [u.id, u.username]));
    return rows.map((r) => ({
      user_id: r.parent_user_id,
      username: userMap.get(r.parent_user_id) || `用户${r.parent_user_id}`,
      invite_count: r._count.id,
    }));
  }

  async investSummary(params: StatsQuery) {
    const { from, to, granularity } = parseDateRange(params);
    const orders = await this.prisma.order.findMany({
      where: {
        created_at: { gte: from, lte: to },
        status: { in: ['ACTIVE', 'SETTLED', 'PAID'] },
      },
      select: { created_at: true, amount: true },
    });
    return {
      amount_series: buildSeries(
        orders,
        (o) => o.created_at,
        (o) => decimalToNumber(o.amount),
        from,
        to,
        granularity,
      ),
      order_count_series: buildSeries(orders, (o) => o.created_at, () => 1, from, to, granularity),
    };
  }

  async investByProduct(_params: StatsQuery) {
    const rows = await this.prisma.order.groupBy({
      by: ['product_id'],
      where: { status: { in: ['ACTIVE', 'SETTLED', 'PAID'] } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
    });
    const products = await this.prisma.product.findMany({
      where: { id: { in: rows.map((r) => r.product_id) } },
    });
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    return rows.map((r) => ({
      product_id: r.product_id,
      product_name: productMap.get(r.product_id) || `产品${r.product_id}`,
      total_invest_amount: decimalToNumber(r._sum.amount),
      order_count: r._count.id,
    }));
  }

  async commissionSummary(params: StatsQuery) {
    const { from, to, granularity } = parseDateRange(params);
    const pending = await this.prisma.commission.findMany({
      where: { created_at: { gte: from, lte: to }, status: 'PENDING' },
      select: { created_at: true, amount: true },
    });
    const paid = await this.prisma.commission.findMany({
      where: { paid_at: { gte: from, lte: to }, status: 'PAID' },
      select: { paid_at: true, amount: true },
    });
    return {
      pending_series: buildSeries(
        pending,
        (c) => c.created_at,
        (c) => decimalToNumber(c.amount),
        from,
        to,
        granularity,
      ),
      paid_series: buildSeries(
        paid,
        (c) => c.paid_at!,
        (c) => decimalToNumber(c.amount),
        from,
        to,
        granularity,
      ),
    };
  }

  async commissionCostRate(_params: StatsQuery) {
    const [investAgg, commissionAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where: { status: { in: ['ACTIVE', 'SETTLED', 'PAID'] } },
        _sum: { amount: true },
      }),
      this.prisma.commission.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);
    const revenue = decimalToNumber(investAgg._sum.amount);
    const totalCommission = decimalToNumber(commissionAgg._sum.amount);
    const costRate = revenue > 0 ? totalCommission / revenue : 0;
    return {
      cost_rate: Math.round(costRate * 10000) / 10000,
      total_commission: totalCommission,
      total_revenue: revenue,
    };
  }

  async createExport(type: 'overview' | 'users' | 'orders' | 'products', params: StatsQuery) {
    const taskId = `EXPORT-${Date.now()}`;
    let content = '';
    let filename = 'export.csv';

    if (type === 'overview') {
      const [overview, conversion, costRate] = await Promise.all([
        this.overview(params),
        this.userConversion(params),
        this.commissionCostRate(params),
      ]);
      content = toCsv(['metric', 'value'], [
        ['new_users_today', overview.cards.new_users],
        ['invest_amount_total', overview.cards.invest_amount],
        ['withdraw_success_amount', overview.cards.withdraw_success_amount],
        ['commission_paid', overview.cards.commission_paid],
        ['registered_users', conversion.new_users],
        ['first_invest_users', conversion.first_invest_users],
        ['conversion_rate', conversion.conversion_rate],
        ['commission_cost_rate', costRate.cost_rate],
      ]);
      filename = 'overview.csv';
    } else if (type === 'users') {
      const { from, to } = parseDateRange(params);
      const users = await this.prisma.user.findMany({
        where: { created_at: { gte: from, lte: to } },
        orderBy: { id: 'desc' },
        take: 5000,
      });
      content = toCsv(
        ['user_id', 'username', 'status', 'created_at'],
        users.map((u) => [u.id, u.username, u.status, u.created_at.toISOString()]),
      );
      filename = 'users.csv';
    } else if (type === 'orders') {
      const { from, to } = parseDateRange(params);
      const orders = await this.prisma.order.findMany({
        where: { created_at: { gte: from, lte: to } },
        include: { product: true, user: true },
        orderBy: { id: 'desc' },
        take: 5000,
      });
      content = toCsv(
        ['order_id', 'order_no', 'username', 'product_name', 'amount', 'status', 'created_at'],
        orders.map((o) => [
          o.id,
          o.order_no,
          o.user.username,
          o.product?.name ?? '',
          decimalToNumber(o.amount),
          o.status,
          o.created_at.toISOString(),
        ]),
      );
      filename = 'orders.csv';
    } else {
      const products = await this.investByProduct(params);
      content = toCsv(
        ['product_id', 'product_name', 'total_invest_amount', 'order_count'],
        products.map((p) => [p.product_id, p.product_name, p.total_invest_amount, p.order_count]),
      );
      filename = 'products.csv';
    }

    saveExportTask(taskId, {
      content,
      filename,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });

    return {
      task_id: taskId,
      download_url: `/api/v1/admin/stats/export/${taskId}/download`,
    };
  }

  getExportFile(taskId: string) {
    const task = getExportTask(taskId);
    if (!task) {
      throw new BusinessException('EXPORT_NOT_FOUND', 'Export task not found or expired', HttpStatus.NOT_FOUND);
    }
    return task;
  }
}
