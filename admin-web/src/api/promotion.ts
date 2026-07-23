import request from '@/utils/request';
import type { 
    PromoLinkInfo, 
    DistributorQueryParams, 
    DistributorListResult, 
    DistributorDetail, 
    DistributorOrderQueryParams, 
    DistributorOrderListResult 
} from '@/types/promotion';

// Promo Link
export function getUserPromoLink(userId: number) {
  return request.get<PromoLinkInfo>(`/admin/promo/users/${userId}/link`);
}

export function resetUserPromoLink(userId: number, reason: string) {
  return request.post(`/admin/promo/users/${userId}/link/reset`, { reason, admin_id: 0 });
}

// Distributor
export function getDistributorList(params: DistributorQueryParams) {
  return request.get<DistributorListResult>('/admin/distributors', params);
}

export function getDistributorDetail(userId: number) {
  return request.get<DistributorDetail>(`/admin/distributors/${userId}`);
}

export function auditDistributor(userId: number, data: { status: 1 | 2; reason: string }) {
  return request.post(`/admin/distributors/${userId}/audit`, data);
}

export function updateDistributorLevel(userId: number, data: { level_id: number; reason: string }) {
  return request.post(`/admin/distributors/${userId}/level`, data);
}

export function getDistributorOrders(userId: number, params: DistributorOrderQueryParams) {
  return request.get<DistributorOrderListResult>(`/admin/distributors/${userId}/orders`, params);
}
