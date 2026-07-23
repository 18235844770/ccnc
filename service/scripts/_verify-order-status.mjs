import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const orderId = Number(process.argv[2] || 5);

async function main() {
  const o = await p.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, end_date: true },
  });
  console.log(JSON.stringify(o));
}

main()
  .finally(() => p.$disconnect());
