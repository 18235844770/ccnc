import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const p = new PrismaClient();
const orderId = Number(process.argv[2] || 7);

function n(v) {
  if (v == null) return 0;
  return typeof v === 'number' ? v : Number(v);
}

async function main() {
  const order = await p.order.findUnique({ where: { id: orderId } });
  console.log('order', { id: order?.id, status: order?.status });
  if (!order || order.status !== 'ACTIVE') return;

  const principal = n(order.amount);
  const profit = n(order.profit);
  const total = principal + profit;

  await p.$transaction(async (tx) => {
    let wallet = await tx.wallet.findUnique({
      where: { user_id_type: { user_id: order.user_id, type: 'BALANCE' } },
    });
    if (!wallet) {
      wallet = await tx.wallet.create({ data: { user_id: order.user_id, type: 'BALANCE' } });
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
        description: 'verify settle',
      },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'SETTLED', end_date: new Date() },
    });
  });
  console.log(`settled order ${orderId} +${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
