// Fund Management Types

export type WithdrawStatus = 'PENDING' | 'SUCCESS' | 'REJECTED';
export type LedgerBizType = 'RECHARGE' | 'WITHDRAW' | 'PAY_ORDER' | 'PROFIT' | 'COMMISSION' | 'ADJUSTMENT';

export interface WithdrawRecord {
  id: number;
  user_id: number;
  amount: number;
  address: string;
  network: string;
  status: WithdrawStatus;
  created_at: string;
}

export interface LedgerRecord {
  id: number;
  user_id: number;
  type: LedgerBizType;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface WithdrawQueryParams {
  page: number;
  page_size: number;
  user_id?: number;
  status?: WithdrawStatus;
  time_from?: string;
  time_to?: string;
}

export interface LedgerQueryParams {
  page: number;
  page_size: number;
  user_id?: number;
  biz_type?: string;
}

export interface WithdrawListResult {
  total: number;
  records: WithdrawRecord[];
}

export interface LedgerListResult {
  total: number;
  records: LedgerRecord[];
}

export const WithdrawStatusMap: Record<WithdrawStatus, string> = {
  'PENDING': '待审核',
  'SUCCESS': '提现成功',
  'REJECTED': '已驳回'
};

export const WithdrawStatusColorMap: Record<WithdrawStatus, string> = {
  'PENDING': 'orange',
  'SUCCESS': 'green',
  'REJECTED': 'red'
};

export const BizTypeMap: Record<string, string> = {
  'RECHARGE': '充值',
  'WITHDRAW': '提现',
  'WITHDRAW_REJECT': '提现驳回',
  'PAY_ORDER': '订单支付',
  'PROFIT': '收益结算',
  'COMMISSION': '佣金',
  'ADJUSTMENT': '系统调账'
};
