import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const c = await p.commission.findUnique({ where: { id: 3 } });
  console.log('commission 3:', {
    id: c.id,
    status: c.status,
    amount: String(c.amount),
    settled_at: c.settled_at,
    paid_at: c.paid_at,
    to_user_id: c.to_user_id,
  });

  const logs = await p.walletLog.findMany({
    where: { OR: [{ reference_type: 'COMMISSION' }, { user_id: 2 }] },
    orderBy: { id: 'desc' },
    take: 15,
  });
  console.log(
    'wallet logs:',
    logs.map((l) => ({
      id: l.id,
      user_id: l.user_id,
      type: l.type,
      reference_type: l.reference_type,
      reference_id: l.reference_id,
      amount: String(l.amount),
    })),
  );

  const cs = await p.commission.groupBy({ by: ['status'], _count: true });
  console.log('commission by status:', cs);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
