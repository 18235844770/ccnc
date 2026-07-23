import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import fs from 'fs';

const p = new PrismaClient();

function readCtx() {
  const raw = fs.readFileSync(new URL('./_verify-ctx.json', import.meta.url), 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
}

function n(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  return Number(v);
}

async function settleOne(orderId) {
  await p.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== 'ACTIVE') {
      console.log('skip settle, status=', order?.status);
      return;
    }
    const principal = n(order.amount);
    const profit = n(order.profit);
    const total = principal + profit;

    let wallet = await tx.wallet.findUnique({
      where: { user_id_type: { user_id: order.user_id, type: 'BALANCE' } },
    });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { user_id: order.user_id, type: 'BALANCE' },
      });
    }
    const before = n(wallet.balance_available);
    const after = before + total;
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance_available: new Decimal(after), version: { increment: 1 } },
    });
    await tx.walletLog.create({
      data: {
        wallet_id: wallet.id,
        user_id: order.user_id,
        type: 'CREDIT',
        wallet_type: 'BALANCE',
        reference_id: String(orderId),
        reference_type: 'ORDER_SETTLE',
        amount: new Decimal(total),
        balance_before: new Decimal(before),
        balance_after: new Decimal(after),
        description: `Order settle principal ${principal} + profit ${profit}`,
      },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'SETTLED', end_date: new Date('2020-01-01T00:00:00.000Z') },
    });
    console.log(`settled order ${orderId}: +${total} (principal ${principal} + profit ${profit})`);
  });
}

async function main() {
  const ctx = readCtx();
  const orderId = ctx.orderId;
  const before = await p.order.findUnique({ where: { id: orderId } });
  console.log('before:', {
    id: before.id,
    status: before.status,
    end_date: before.end_date,
    amount: String(before.amount),
    profit: before.profit != null ? String(before.profit) : null,
  });

  // Mimic expire then settle (same as cron) for verification when cron may not fire in window
  await p.order.update({
    where: { id: orderId },
    data: { end_date: new Date('2020-01-01T00:00:00.000Z') },
  });
  await settleOne(orderId);

  const after = await p.order.findUnique({ where: { id: orderId } });
  console.log('after:', { id: after.id, status: after.status, end_date: after.end_date });

  const commissions = await p.commission.findMany({
    where: { biz_id: String(orderId), biz_type: 'ORDER' },
  });
  console.log(
    'commissions still:',
    commissions.map((c) => ({ id: c.id, status: c.status, amount: String(c.amount) })),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
