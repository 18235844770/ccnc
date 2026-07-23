// Promotion & Distributor Types

export type PromoLinkStatus = 'ACTIVE' | 'INACTIVE';
export type AuditStatus = 0 | 1 | 2; // 0=待审核, 1=已通过, 2=驳回

export interface PromoLinkInfo {
  user_id: number;
  invite_code: string;
  link: string;
  status: PromoLinkStatus;
}

export interface DistributorListItem {
  user_id: number;
  username?: string; // List API doc doesn't show username but usually needed for display
  level_id: number;
  audit_status: AuditStatus;
  total_commission: number;
  total_sales: number;
  join_time: string;
}

export interface DistributorDetail {
  profile: DistributorListItem;
  user: {
    user_id: number;
    username: string;
    phone?: string;
    email?: string;
  };
  team: {
    l1_count: number;
    l2_count: number;
    l3_count: number;
  };
}

export interface DistributorOrder {
  id: string;
  user_id: number;
  username: string;
  amount: number;
  created_at: string;
}

export interface DistributorQueryParams {
  page: number;
  page_size: number;
  level_id?: number;
  audit_status?: AuditStatus;
}

export interface DistributorOrderQueryParams {
  page: number;
  page_size: number;
}

export interface DistributorListResult {
  total: number;
  list: DistributorListItem[];
}

export interface DistributorOrderListResult {
  total: number;
  list: DistributorOrder[];
}

export const AuditStatusMap: Record<AuditStatus, string> = {
  0: '待审核',
  1: '已通过',
  2: '已驳回'
};

export const AuditStatusColorMap: Record<AuditStatus, string> = {
  0: 'orange',
  1: 'green',
  2: 'red'
};
