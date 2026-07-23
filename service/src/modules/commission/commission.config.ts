export const MAX_COMMISSION_LEVEL = 5;

export type CommissionBaseType = 'AMOUNT' | 'PROFIT';

export interface CommissionRuleConfig {
  base_type: CommissionBaseType;
  max_level: number;
  rates: number[];
  /** 订单到期后额外延迟 N 天再结算分润，0 表示订单 SETTLED 即可结算 */
  settle_delay_days?: number;
  /** 单次发放批大小 */
  payout_batch_size?: number;
}

export const DEFAULT_COMMISSION_RULE: CommissionRuleConfig = {
  base_type: 'AMOUNT',
  max_level: MAX_COMMISSION_LEVEL,
  rates: [0.05, 0.03, 0.02, 0.01, 0.005],
  settle_delay_days: 0,
  payout_batch_size: 100,
};

export function commissionTypeByLevel(level: number): 'DIRECT' | 'TEAM' | 'SAME_LEVEL' {
  if (level === 1) return 'DIRECT';
  return 'TEAM';
}

export function parseAncestors(path: string, parentUserId: number, maxLevel: number) {
  const ancestors: { userId: number; level: number }[] = [{ userId: parentUserId, level: 1 }];
  if (!path) return ancestors.slice(0, maxLevel);

  const ids = path
    .split('/')
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);
  const reversed = [...ids].reverse();
  let level = 2;
  for (const id of reversed) {
    if (id === parentUserId) continue;
    if (level > maxLevel) break;
    ancestors.push({ userId: id, level });
    level += 1;
  }
  return ancestors.slice(0, maxLevel);
}
