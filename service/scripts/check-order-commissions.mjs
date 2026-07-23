import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  for (const orderId of [1, 2, 3, 4, 5]) {
    const rows = await p.commission.findMany({ where: { biz_id: String(orderId), biz_type: 'ORDER' } });
    console.log(`order ${orderId} commissions:`, rows.map((r) => ({ id: r.id, status: r.status, to: r.to_user_id, amount: String(r.amount) })));
  }
}

main().finally(() => p.$disconnect());
