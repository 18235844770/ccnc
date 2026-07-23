import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orderId = Number(process.argv[2] || 2);
  await prisma.order.update({
    where: { id: orderId },
    data: { end_date: new Date('2020-01-01') },
  });
  console.log(`Order ${orderId} end_date set to past`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
