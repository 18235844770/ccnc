import request from '@/utils/request';
import type { UserInfoData, LoginResult } from '@/types/system';

export function login(data: { username: string; password: string }) {
  // Returns ApiResponse which contains token
  return request.post<LoginResult>('/admin/auth/login', data); 
}

export function getUserInfo() {
  // Returns ApiResponse<UserInfoData>
  return request.get<UserInfoData>('/admin/auth/info');
}

export function getMenusTree() {
  return request.get<any[]>('/admin/auth/menus/tree');
}
