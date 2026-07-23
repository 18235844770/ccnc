/**
 * 钱包 / 提现 API
 */
import { request } from "@/utils/request";

export interface WalletItem {
  id: number;
  user_id: number;
  type: string;
  balance_available: number;
  balance_frozen: number;
}

export interface WalletLogItem {
  id: number;
  type: string;
  wallet_type: string;
  amount: number;
  balance_after: number;
  description?: string;
  reference_type?: string;
  created_at: string;
}

export interface WithdrawItem {
  id: number;
  withdraw_id: number;
  amount: number;
  fee: number;
  status: string;
  created_at: string;
}

export function fetchWallets() {
  return request<{ data: WalletItem[] }>({ url: "/wallets", method: "GET" });
}

export function fetchWalletLedger(params?: { page?: number; page_size?: number; wallet_type?: string }) {
  return request<{ data: { total: number; records: WalletLogItem[] } }>({
    url: "/wallets/ledger",
    method: "GET",
    params,
  });
}

export function applyWithdraw(data: { amount: number; wallet_type?: string; address?: string }) {
  return request<{ data: { withdraw_id: number } }>({
    url: "/withdraw",
    method: "POST",
    data,
  });
}

export function fetchWithdraws(params?: { page?: number; page_size?: number; status?: string }) {
  return request<{ data: { total: number; records: WithdrawItem[] } }>({
    url: "/withdraws",
    method: "GET",
    params,
  });
}

export interface RechargeItem {
  id: number;
  recharge_id: number;
  biz_id: string;
  amount: number;
  status: string;
  channel?: string;
  created_at: string;
}

export function createRecharge(data: { amount: number; channel?: string }) {
  return request<{ data: { recharge_id: number; biz_id: string; amount: number; pay_url: string } }>({
    url: "/recharge",
    method: "POST",
    data,
  });
}

export function confirmRechargeNotify(data: { biz_id: string; amount?: number; status?: string }) {
  return request<{ status: string; message: string; recharge_id?: number }>({
    url: "/recharge/notify",
    method: "POST",
    data: { ...data, status: data.status || "SUCCESS" },
  });
}

export function fetchRecharges(params?: { page?: number; page_size?: number; status?: string }) {
  return request<{ data: { total: number; records: RechargeItem[] } }>({
    url: "/recharges",
    method: "GET",
    params,
  });
}
