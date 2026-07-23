import request from '@/utils/request';
import type { Role, Menu, AdminUser, AuditLog } from '@/types/system';

// Role Management
export function getRoles() {
  return request.get<Role[]>('/admin/system/roles');
}

export function createRole(data: Pick<Role, 'name' | 'key' | 'status'>) {
  return request.post('/admin/system/roles', data);
}

export function updateRole(id: number, data: Partial<Pick<Role, 'name' | 'key' | 'status'>>) {
  return request.put(`/admin/system/roles/${id}`, data);
}

export function assignRoleMenus(roleId: number, menuIds: number[]) {
  return request.post(`/admin/system/roles/${roleId}/menus`, { menu_ids: menuIds });
}

export function getRoleMenus(roleId: number) {
  return request.get<number[]>(`/admin/system/roles/${roleId}/menus`);
}

// Menu Management
function normalizeMenuList(payload: unknown): Menu[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const list = data.list ?? data.records ?? data.menus ?? data.items;
    if (Array.isArray(list)) {
      return list as Menu[];
    }
  }
  return [];
}

export function getMenus() {
  return request.get<Menu[]>('/admin/system/menus').then((res) => ({
    ...res,
    data: normalizeMenuList(res.data),
  }));
}

export function createMenu(data: Omit<Menu, 'id' | 'children'>) {
  return request.post('/admin/system/menus', data);
}

export function updateMenu(id: number, data: Partial<Omit<Menu, 'id' | 'children'>>) {
  return request.put(`/admin/system/menus/${id}`, data);
}

// Admin User Management
export function getAdmins(params: { page: number; page_size: number }) {
  // The doc doesn't specify the exact response structure for list (usually { list: [], total: 0 }), 
  // but let's assume standard paging or array for now. 
  // Wait, the doc for audit logs shows { total, list }. 
  // Let's assume admins list is similar or just a list? 
  // Doc 2.4.1 says "Admin List", doesn't show response. 
  // Usually paginated APIs return { list, total }.
  return request.get<{ list: AdminUser[]; total: number }>('/admin/system/admins', params);
}

export function createAdmin(data: { username: string; password: string; role_ids: number[] }) {
  return request.post('/admin/system/admins', data);
}

export function resetAdminPassword(id: number, password: string) {
  return request.post(`/admin/system/admins/${id}/reset-pwd`, { password });
}

// Audit Log
export function getAuditLogs(params: { 
  admin_id?: number; 
  action?: string; 
  start_time?: string; 
  end_time?: string; 
  page: number; 
  page_size: number 
}) {
  return request.get<{ list: AuditLog[]; total: number }>('/admin/system/audit-logs', params);
}
