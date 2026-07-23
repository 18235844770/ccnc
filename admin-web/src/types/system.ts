export interface Role {
  id: number;
  name: string;
  key: string;
  status: number;
  created_at: string;
}

export interface Menu {
  id: number;
  parent_id: number;
  name: string;
  type: 1 | 2 | 3; // 1=Directory, 2=Menu, 3=Button
  path?: string;
  component?: string;
  permission?: string;
  sort: number;
  visible: boolean;
  children?: Menu[];
}

export interface AdminUser {
  id: number;
  username: string;
  avatar?: string;
  status?: number;
  roles?: Role[]; // The doc example shows roles inside user object in getInfo, but maybe not in list
  role_ids?: number[];
  created_at?: string;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: number;
  reason: string;
  created_at: string;
}

export interface UserInfoData {
  user: AdminUser;
  roles: string[];
  permissions: string[];
}

export interface LoginResult {
  token: string;
}
