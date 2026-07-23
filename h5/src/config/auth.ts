/**
 * 权限与登录校验配置
 * 定义需要登录才能访问的页面
 */

/** 无需登录即可访问的页面路径 */
export const PUBLIC_PAGES = [
	"/pages/index/index",
	"/pages/explore/index",
	"/pages/consultation/index",
	"/pages/consultation/detail",
	"/pages/content/index",
	"/pages/content/service",
	"/pages/login/index",
	"/pages/register/index",
	"/pages/order/pay-callback",
];

/** 登录页路径 */
export const LOGIN_PAGE = "/pages/login/index";

/**
 * 判断指定路径是否需要登录
 * @param path 页面路径，如 /pages/user/index
 */
export function isAuthRequired(path: string): boolean {
	if (!path) return false;
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return !PUBLIC_PAGES.some((p) => normalized === p || normalized.startsWith(p + "?"));
}

/**
 * 判断是否为登录页
 */
export function isLoginPage(path: string): boolean {
	if (!path) return false;
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return normalized === LOGIN_PAGE || normalized.startsWith(LOGIN_PAGE + "?");
}
