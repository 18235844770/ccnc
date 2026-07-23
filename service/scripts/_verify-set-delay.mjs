import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const delayDays = Number(process.argv[2] ?? 0);

async function main() {
  const rule = await p.commissionRule.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { published_at: 'desc' },
  });
  if (!rule) throw new Error('no active rule');
  const cfg = JSON.parse(rule.config);
  cfg.settle_delay_days = delayDays;
  await p.commissionRule.update({
    where: { id: rule.id },
    data: { config: JSON.stringify(cfg) },
  });
  console.log(JSON.stringify({ id: rule.id, settle_delay_days: delayDays, config: cfg }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
