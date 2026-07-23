/**
 * 推广收益 / 分润 API
 */
import { request } from "@/utils/request";

export interface CommissionItem {
  id: number;
  from_user_id: number;
  relation_level: number;
  amount: number;
  status: string;
  biz_type: string;
  biz_id: string;
  created_at: string;
}

export interface CommissionSummary {
  pending: number;
  settled: number;
  paid: number;
  total: number;
}

export function fetchCommissionSummary() {
  return request<{ data: CommissionSummary }>({ url: "/commissions/summary", method: "GET" });
}

export function fetchCommissions(params?: { page?: number; page_size?: number; status?: string }) {
  return request<{ data: { total: number; records: CommissionItem[] } }>({
    url: "/commissions",
    method: "GET",
    params,
  });
}
