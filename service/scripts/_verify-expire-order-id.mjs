import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const orderId = Number(process.argv[2] || 5);

async function main() {
  const before = await p.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, end_date: true, amount: true, profit: true, user_id: true },
  });
  console.log('before', before);
  if (!before || before.status !== 'ACTIVE') {
    console.log('skip: not ACTIVE');
    return;
  }
  await p.order.update({
    where: { id: orderId },
    data: { end_date: new Date('2019-06-01T00:00:00.000Z') },
  });
  const after = await p.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, end_date: true },
  });
  console.log('after patch', after);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
