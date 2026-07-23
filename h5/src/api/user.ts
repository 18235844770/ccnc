/**
 * 用户相关 API（需登录）
 * 参考 docs/mobile_api.md 二、用户与认证
 */
import { request } from "@/utils/request";

/** 用户信息 */
export interface UserInfoRes {
	id: number;
	username?: string;
	email?: string;
	phone_number?: string;
	status?: string;
	realname_status?: string;
	real_name?: string;
	created_at?: string;
}

export interface RealnameStatusRes {
	auth_status: string;
	real_name?: string;
	created_at?: string;
}

/**
 * 获取当前登录用户信息
 * GET /api/v1/users/me
 */
export function fetchUserInfo() {
	return request<{ data: UserInfoRes }>({
		url: "/users/me",
		method: "GET",
	});
}

/** 查询实名认证状态 */
export function fetchRealnameStatus() {
	return request<{ data: RealnameStatusRes }>({
		url: "/users/me/realname-auth",
		method: "GET",
	});
}

/** 提交实名认证 */
export function submitRealnameAuth(data: { real_name: string; id_card: string }) {
	return request({
		url: "/users/me/realname-auth",
		method: "POST",
		data,
	});
}
