/** E2E 环境与账号常量（对齐 docs/手动流程测试步骤清单.md） */

export const API_URL = process.env.E2E_API_URL || 'http://localhost:3000';
export const H5_URL = process.env.E2E_H5_URL || 'http://localhost:5174';
export const ADMIN_URL = process.env.E2E_ADMIN_URL || 'http://localhost:5173';

export const ACCOUNTS = {
  admin: { username: 'admin', password: '123456' },
  promoter: { username: 'promoter', password: '123456' },
  testuser: { username: 'testuser', password: '123456' },
} as const;

export const INVITE_CODE = 'PROMO001';

/** uni-app H5 路由（hash） */
export function h5Path(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `/#${p}`;
}
