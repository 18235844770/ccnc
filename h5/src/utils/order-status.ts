const STATUS_LABELS: Record<string, string> = {
  PENDING: "待支付",
  ACTIVE: "计息中",
  SETTLED: "已结算",
  PAID: "已支付",
  CANCELLED: "已取消",
  REFUNDED: "已退款",
};

export function orderStatusText(status?: string) {
  return STATUS_LABELS[status || ""] || status || "未知";
}

export const ORDER_STATUS_TABS = [
  { label: "全部", value: "" },
  { label: "待支付", value: "PENDING" },
  { label: "计息中", value: "ACTIVE" },
  { label: "已结算", value: "SETTLED" },
  { label: "已取消", value: "CANCELLED" },
];
