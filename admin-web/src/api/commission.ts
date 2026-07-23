import request from '@/utils/request';
import type { CommissionQueryParams, CommissionListResult, CommissionDetail } from '@/types/commission';

// Commission Query
export function getCommissionList(params: CommissionQueryParams) {
  return request.get<CommissionListResult>('/admin/commissions', params);
}

export function getCommissionDetail(id: number) {
  return request.get<CommissionDetail>(`/admin/commissions/${id}`);
}

// Status Management
export function freezeCommission(id: number, reason: string) {
  return request.post(`/admin/commissions/${id}/freeze`, { reason });
}

export function unfreezeCommission(id: number, reason: string) {
  return request.post(`/admin/commissions/${id}/unfreeze`, { reason });
}

export function voidCommission(id: number, reason: string) {
  return request.post(`/admin/commissions/${id}/void`, { reason });
}

// Manual Intervention
export function manualCreditCommission(data: { user_id: number; amount: number; reason: string }) {
  return request.post('/admin/commissions/manual-credit', data);
}

export function manualReverseCommission(data: { user_id: number; amount: number; reason: string }) {
  return request.post('/admin/commissions/manual-reverse', data);
}

// Config Rule
export function publishCommissionRule(data: { name: string; config: string }) {
  return request.post('/admin/commission-rules/publish', data);
}

export function getCommissionRules() {
  return request.get('/admin/commission-rules');
}

export function getActiveCommissionRule() {
  return request.get('/admin/commission-rules/active');
}
