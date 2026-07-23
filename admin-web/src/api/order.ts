import request from '@/utils/request';
import type { OrderQueryParams, OrderListResult, OrderDetail } from '@/types/order';

export function getOrderList(params: OrderQueryParams) {
  return request.get<OrderListResult>('/admin/orders', params);
}

export function getOrderDetail(id: string) {
  return request.get<OrderDetail>(`/admin/orders/${id}`);
}

export function refundOrder(id: string | number, reason: string) {
  return request.post(`/admin/orders/${id}/refund`, { reason });
}
