import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({ select: { id: true, username: true, status: true } });
  console.log('users:', users);

  const rels = await p.userRelation.findMany();
  console.log('relations:', rels);

  const wallets = await p.wallet.findMany();
  console.log(
    'wallets:',
    wallets.map((w) => ({
      user_id: w.user_id,
      type: w.type,
      avail: String(w.balance_available),
      frozen: String(w.balance_frozen),
    })),
  );

  const invites = await p.inviteProgress.findMany();
  console.log(
    'invite_progress:',
    invites.map((i) => ({
      user_id: i.user_id,
      valid_count: i.valid_count,
      unlock_ratio: String(i.unlock_ratio),
    })),
  );

  const products = await p.product.findMany({ take: 10 });
  console.log(
    'products:',
    products.map((pr) => ({
      id: pr.id,
      name: pr.name,
      status: pr.status,
      min_amount: String(pr.min_amount),
      max_amount: pr.max_amount != null ? String(pr.max_amount) : null,
      yield_rate: String(pr.yield_rate),
      cycle_days: pr.cycle_days,
    })),
  );

  const rules = await p.commissionRule.findMany({ take: 5, orderBy: { id: 'desc' } });
  console.log(
    'rules:',
    rules.map((r) => ({
      id: r.id,
      status: r.status,
      version: r.version,
      config: r.config,
    })),
  );

  const walletLogs = await p.walletLog.findMany({
    where: { reference_type: 'COMMISSION' },
    orderBy: { id: 'desc' },
    take: 10,
  });
  console.log(
    'commission wallet_logs:',
    walletLogs.map((l) => ({
      id: l.id,
      user_id: l.user_id,
      amount: String(l.amount),
      reference_id: l.reference_id,
      created_at: l.created_at,
    })),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
