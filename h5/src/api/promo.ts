/**
 * 推广中心 API
 */
import { request } from "@/utils/request";

export interface PromoSummary {
  invite_code: string;
  share_url: string;
  link_status?: string;
  promo_level: number;
  direct_count: number;
  team_count: number;
  commission_total: number;
  level_counts?: {
    l1_count: number;
    l2_count: number;
    l3_count: number;
    l4_count?: number;
    l5_count?: number;
  };
  invite_unlock?: {
    valid_count: number;
    unlock_ratio: number;
    unlock_percent: number;
  };
}

export interface DownlineItem {
  user_id: number;
  username: string;
  level: number;
  promo_level: number;
  invest_amount: number;
  order_count: number;
  joined_at: string;
}

export interface DownlineListResult {
  total: number;
  records: DownlineItem[];
}

/** GET /api/v1/promotion/summary */
export function fetchPromoSummary() {
  return request<{ data: PromoSummary }>({
    url: "/promotion/summary",
    method: "GET",
  });
}

/** GET /api/v1/promotion/downlines */
export function fetchPromoDownlines(params?: { level?: number; page?: number; page_size?: number }) {
  return request<{ data: DownlineListResult }>({
    url: "/promotion/downlines",
    method: "GET",
    params,
  });
}
