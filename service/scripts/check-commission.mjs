import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const cs = await p.commission.groupBy({ by: ['status'], _count: true });
  console.log('commission by status:', cs);
  const os = await p.order.groupBy({ by: ['status'], _count: true });
  console.log('orders by status:', os);
  const rows = await p.commission.findMany({ take: 10, orderBy: { id: 'desc' } });
  console.log(
    'recent commissions:',
    rows.map((r) => ({
      id: r.id,
      status: r.status,
      biz_id: r.biz_id,
      amount: String(r.amount),
      settled_at: r.settled_at,
      paid_at: r.paid_at,
    })),
  );
  const orders = await p.order.findMany({ take: 10, orderBy: { id: 'desc' } });
  console.log(
    'recent orders:',
    orders.map((o) => ({
      id: o.id,
      status: o.status,
      user_id: o.user_id,
      amount: String(o.amount),
      end_date: o.end_date,
    })),
  );
}

main()
  .finally(() => p.$disconnect());
