/**
 * 认证相关 API
 * 参考 docs/mobile_api.md 二、用户与认证
 */
import { request } from "@/utils/request";

/** 登录请求参数 */
export interface LoginParams {
	username: string;
	password: string;
}

/** 登录响应 */
export interface LoginResponse {
	status: string;
	token?: string;
	message?: string;
}

/** 注册请求参数 */
export interface RegisterParams {
	username: string;
	password: string;
	invite_code?: string;
	email?: string;
	phone_number?: string;
	captcha?: string;
}

/** 注册响应 */
export interface RegisterResponse {
	status: string;
	message?: string;
}

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
export function login(data: LoginParams) {
	return request<LoginResponse>({
		url: "/auth/login",
		method: "POST",
		data,
		skipErrorHandler: false,
	});
}

/**
 * 用户注册
 * POST /api/v1/auth/register
 */
export function register(data: RegisterParams) {
	return request<RegisterResponse>({
		url: "/auth/register",
		method: "POST",
		data,
		skipErrorHandler: false,
	});
}
