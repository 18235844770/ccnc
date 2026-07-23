import request from '@/utils/request';
import type { WithdrawQueryParams, WithdrawListResult, LedgerQueryParams, LedgerListResult } from '@/types/fund';

// Withdraw
export function getWithdrawList(params: WithdrawQueryParams) {
  return request.get<WithdrawListResult>('/admin/withdraws', params);
}

export function approveWithdraw(id: number) {
  return request.post(`/admin/withdraws/${id}/approve`);
}

export function rejectWithdraw(id: number, reason: string) {
  return request.post(`/admin/withdraws/${id}/reject`, { reason });
}

// Ledger
export function getLedgerList(params: LedgerQueryParams) {
  return request.get<LedgerListResult>('/admin/wallets/ledger', params);
}

// Adjustment
export function adjustBalance(data: { user_id: number; amount: number; description: string }) {
  return request.post('/admin/wallets/adjustment', data);
}
