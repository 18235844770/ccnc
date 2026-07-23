// Commission Management Types

export type CommissionStatus = 'PENDING' | 'SETTLED' | 'PAID' | 'FROZEN' | 'VOID';
export type CommissionType = 'DIRECT' | 'TEAM' | 'SAME_LEVEL';

export interface CommissionListItem {
  id: number;
  user_id: number;
  amount: number;
  source_order_id: string;
  from_user_id: number;
  status: CommissionStatus;
  type?: CommissionType; // List doc doesn't show type in item example, but query param has it. Assuming backend returns it.
  created_at: string;
}

export interface CommissionDetail extends CommissionListItem {
  rule_snapshot?: string;
  manual_flag: boolean;
}

export interface CommissionQueryParams {
  page: number;
  page_size: number;
  user_id?: number;
  status?: CommissionStatus;
  type?: CommissionType;
}

export interface CommissionListResult {
  total: number;
  list: CommissionListItem[];
}

export const CommissionStatusMap: Record<CommissionStatus, string> = {
  'PENDING': '待结算',
  'SETTLED': '已结算',
  'PAID': '已发放',
  'FROZEN': '已冻结',
  'VOID': '已作废'
};

export const CommissionStatusColorMap: Record<CommissionStatus, string> = {
  'PENDING': 'orange',
  'SETTLED': 'blue',
  'PAID': 'green',
  'FROZEN': 'red',
  'VOID': 'gray'
};
