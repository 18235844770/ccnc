/**
 * BE-043 财务对账脚本：校验 wallet 余额与流水累计是否一致
 * 用法: pnpm reconcile:wallets
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const wallets = await prisma.wallet.findMany();
  let mismatches = 0;

  for (const wallet of wallets) {
    const logs = await prisma.walletLog.findMany({ where: { wallet_id: wallet.id } });
    const sum = logs.reduce((acc, log) => acc + Number(log.amount), 0);
    const available = Number(wallet.balance_available);
    const expected = sum;
    const diff = Math.abs(available - expected);
    if (diff > 0.01) {
      mismatches += 1;
      console.log(
        `[MISMATCH] wallet=${wallet.id} user=${wallet.user_id} type=${wallet.type} ` +
          `balance=${available.toFixed(2)} logs_sum=${expected.toFixed(2)} diff=${diff.toFixed(2)}`,
      );
    }
  }

  if (mismatches === 0) {
    console.log(`OK: ${wallets.length} wallets reconciled`);
  } else {
    console.log(`Found ${mismatches} mismatched wallet(s)`);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
