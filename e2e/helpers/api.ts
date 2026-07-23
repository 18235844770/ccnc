import { API_URL, ACCOUNTS } from './env';

type Json = Record<string, unknown>;

async function request<T = Json>(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown },
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = (await res.json()) as T & { status?: string; message?: string };
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function adminLogin(username = ACCOUNTS.admin.username, password = ACCOUNTS.admin.password) {
  const data = await request<{ status: string; token: string }>('POST', '/api/v1/admin/auth/login', {
    body: { username, password },
  });
  if (!data.token) throw new Error('admin login missing token');
  return data.token;
}

export async function userLogin(username: string, password: string) {
  const data = await request<{ status: string; token: string }>('POST', '/api/v1/auth/login', {
    body: { username, password },
  });
  if (!data.token) throw new Error('user login missing token');
  return data.token;
}

export async function userRegister(username: string, password: string, inviteCode?: string) {
  return request('POST', '/api/v1/auth/register', {
    body: { username, password, invite_code: inviteCode },
  });
}

export async function submitRealname(token: string, realName = '流程测试', idCard = '110101199001011234') {
  return request('POST', '/api/v1/users/me/realname-auth', {
    token,
    body: { real_name: realName, id_card: idCard },
  });
}

export async function getMe(token: string) {
  return request<{ status: string; data: { id: number; username: string } }>('GET', '/api/v1/users/me', {
    token,
  });
}

export async function adjustBalance(adminToken: string, userId: number, amount: number, description = 'e2e topup') {
  return request('POST', '/api/v1/admin/wallets/adjustment', {
    token: adminToken,
    body: { user_id: userId, amount, description },
  });
}

export async function createOrder(token: string, productId: number, amount: number) {
  return request<{ status: string; data: { order_id: number } }>('POST', '/api/v1/orders', {
    token,
    body: { product_id: productId, amount },
  });
}

export async function payOrder(token: string, orderId: number, paymentAmount: number) {
  return request('POST', `/api/v1/orders/${orderId}/pay`, {
    token,
    body: { payment_method: 'BALANCE', payment_amount: paymentAmount },
  });
}

export async function runSettlement(adminToken: string) {
  return request<{ status: string; data: { settled: number; paid: number } }>(
    'POST',
    '/api/v1/admin/commissions/run-settlement',
    { token: adminToken },
  );
}

export async function listAdminCommissions(adminToken: string, page = 1, pageSize = 50) {
  return request<{
    status: string;
    data: {
      total: number;
      list: Array<{
        id: number;
        status: string;
        amount: number;
        source_order_id: string;
        user_id: number;
      }>;
    };
  }>('GET', `/api/v1/admin/commissions?page=${page}&page_size=${pageSize}`, { token: adminToken });
}

export async function getWallets(token: string) {
  return request<{
    status: string;
    data: Array<{ type: string; balance_available: number }>;
  }>('GET', '/api/v1/wallets', { token });
}

export async function getPromoSummary(token: string) {
  return request<{
    status: string;
    data: { invite_code: string; share_url: string; link_status: string };
  }>('GET', '/api/v1/promotion/summary', { token });
}

export async function healthCheck() {
  const res = await fetch(`${API_URL}/api/docs`);
  if (!res.ok) throw new Error(`API not ready: ${res.status}`);
}
