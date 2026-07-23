import request from '@/utils/request';
import type { OverviewData, StatsQueryParams, ConversionData, PromoTopItem, ProductInvestStats, ChartSeriesItem } from '@/types/stats';

// Dashboard Overview
export function getStatsOverview(params: StatsQueryParams) {
  return request.get<OverviewData>('/admin/stats/overview', params);
}

// User Stats
export function getUserGrowth(params: StatsQueryParams) {
  return request.get<{ series: ChartSeriesItem[] }>('/admin/stats/users/growth', params);
}

export function getUserConversion(params: StatsQueryParams) {
  return request.get<ConversionData>('/admin/stats/users/conversion', params);
}

// Promotion Stats
export function getPromoSummary(params: StatsQueryParams) {
  return request.get<{ l1_series: ChartSeriesItem[]; l2_series: ChartSeriesItem[]; l3_series: ChartSeriesItem[] }>('/admin/stats/promo/summary', params);
}

export function getPromoTop(params: { by: 'invite_count' | 'team_invest' | 'team_commission'; limit?: number }) {
  return request.get<PromoTopItem[]>('/admin/stats/promo/top', params);
}

// Invest Stats
export function getInvestSummary(params: StatsQueryParams) {
  return request.get<{ amount_series: ChartSeriesItem[]; order_count_series: ChartSeriesItem[] }>('/admin/stats/invest/summary', params);
}

export function getInvestByProduct(params: StatsQueryParams) {
  return request.get<ProductInvestStats[]>('/admin/stats/invest/by-product', params);
}

// Commission Stats
export function getCommissionSummary(params: StatsQueryParams) {
  return request.get<{ pending_series: ChartSeriesItem[]; paid_series: ChartSeriesItem[] }>('/admin/stats/commission/summary', params);
}

export function getCommissionCostRate(params: StatsQueryParams) {
  return request.get<{ cost_rate: number; total_commission: number; total_revenue: number }>('/admin/stats/commission/cost-rate', params);
}

// Export
export function exportStatsTask(data: { type: 'overview' | 'users' | 'orders' | 'products'; from?: string; to?: string }) {
    return request.post<{ task_id: string; download_url: string }>('/admin/stats/export', data);
}

export async function downloadStatsExport(taskId: string) {
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_APP_BASE_API || '/api/v1';
  const res = await fetch(`${base}/admin/stats/export/${taskId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error('Download failed');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${taskId}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}
