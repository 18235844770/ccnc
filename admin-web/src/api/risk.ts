import request from '@/utils/request';

export interface RiskDashboard {
  open_events: number;
  high_severity: number;
  today_events: number;
  enabled_rules: number;
}

export interface RiskEvent {
  id: number;
  rule_code: string;
  user_id?: number;
  severity: string;
  status: string;
  detail?: string;
  created_at: string;
}

export function getRiskDashboard() {
  return request.get<RiskDashboard>('/admin/risk/dashboard');
}

export function getRiskEvents(params: {
  page: number;
  page_size: number;
  status?: string;
  rule_code?: string;
  user_id?: number;
}) {
  return request.get<{ total: number; list: RiskEvent[] }>('/admin/risk/events', params);
}

export function getRiskRules() {
  return request.get<any[]>('/admin/risk/rules');
}

export function resolveRiskEvent(id: number, data: { action: string; reason?: string }) {
  return request.post(`/admin/risk/events/${id}/resolve`, data);
}

export function triggerRiskScan() {
  return request.post('/admin/risk/scan');
}
