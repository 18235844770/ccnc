import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const p = new PrismaClient();
const ctx = JSON.parse(fs.readFileSync(new URL('./_verify-ctx.json', import.meta.url), 'utf8'));

async function main() {
  const orderId = ctx.orderId;
  const before = await p.order.findUnique({ where: { id: orderId } });
  console.log('order before:', {
    id: before?.id,
    status: before?.status,
    end_date: before?.end_date,
    amount: String(before?.amount),
    profit: before?.profit != null ? String(before.profit) : null,
    user_id: before?.user_id,
  });

  await p.order.update({
    where: { id: orderId },
    data: { end_date: new Date('2020-01-01T00:00:00.000Z') },
  });

  const after = await p.order.findUnique({ where: { id: orderId } });
  console.log('order after end_date patch:', {
    id: after?.id,
    status: after?.status,
    end_date: after?.end_date,
  });

  const wallet = await p.wallet.findUnique({
    where: { user_id_type: { user_id: after.user_id, type: 'BALANCE' } },
  });
  console.log('buyer wallet before settle:', {
    avail: String(wallet?.balance_available),
  });

  const commissions = await p.commission.findMany({
    where: { biz_id: String(orderId), biz_type: 'ORDER' },
  });
  console.log(
    'commissions:',
    commissions.map((c) => ({
      id: c.id,
      status: c.status,
      amount: String(c.amount),
      to: c.to_user_id,
    })),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
