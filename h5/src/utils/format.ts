/**
 * 格式化年化收益率为展示用百分比
 * 后端 yield_rate 为小数（如 0.08 表示 8%）
 */
export function formatYieldRate(rate?: number | null, digits = 2): string {
  if (rate == null || Number.isNaN(rate)) return '0';
  const percent = rate <= 1 ? rate * 100 : rate;
  return percent.toFixed(digits);
}

/** 金额展示（保留 2 位小数） */
export function formatAmount(amount?: number | null): string {
  if (amount == null || Number.isNaN(amount)) return '0.00';
  return amount.toFixed(2);
}
