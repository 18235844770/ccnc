import request from '@/utils/request';
import type { PageResult, AdminUserListItem, UserQueryParams } from '@ccnc/shared';
import type { UserDetailData, DownlineListResult } from '@/types/user';

export function getUserList(params: UserQueryParams) {
  return request.get<PageResult<AdminUserListItem>>('/admin/users', params);
}

export function getUserDetail(userId: number) {
  return request.get<UserDetailData>(`/admin/users/${userId}`);
}

export function getUserDownlines(userId: number, params: { level: number; page: number; page_size: number }) {
  return request.get<DownlineListResult>(`/admin/users/${userId}/downlines`, params);
}

export function adjustUserUpline(userId: number, data: { new_parent_user_id: number; reason: string }) {
  return request.post(`/admin/users/${userId}/promo/adjust`, data);
}

export function banUser(userId: number, data: { mode: 'BANNED' | 'FROZEN'; reason: string }) {
  return request.post(`/admin/users/${userId}/ban`, data);
}

export function unbanUser(userId: number, data: { reason: string }) {
  return request.post(`/admin/users/${userId}/unban`, data);
}
