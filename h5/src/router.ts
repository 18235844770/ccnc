import routes from "uni-router-routes"; //由unplugin-uni-router/vite根据pages.json生成
import { createRouter } from "uniapp-router-next";
import { useUserStore } from "@/store/user";
import { isAuthRequired, isLoginPage, LOGIN_PAGE } from "@/config/auth";

const router = createRouter({
	routes: [
		...routes,
		// 通配符，一般用于匹配不到路径跳转404页面
		{
			path: "*",
			redirect: () => {
				// 可返回{ name: '404' }，{ path: '/pages/404/404' }， '/pages/404/404'
				return { name: "404" };
			},
		},
	],
	//@ts-ignore
	platform: process.env.UNI_PLATFORM,
	h5: {},
});

/**
 * 全局路由守卫：登录校验
 * 需登录页面未登录时跳转登录页
 */
router.beforeEach((to, _from, next) => {
	const path = to.path || to.fullPath || "";
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	// 已是登录页，直接放行
	if (isLoginPage(normalizedPath)) {
		next();
		return;
	}

	// 无需登录的页面，直接放行
	if (!isAuthRequired(normalizedPath)) {
		next();
		return;
	}

	// 需登录页面：检查登录态
	const userStore = useUserStore();
	if (userStore.checkLogin()) {
		next();
		return;
	}

	// 未登录，跳转登录页，并记录来源页供登录后回跳
	uni.showToast({
		title: "请先登录",
		icon: "none",
	});
	next({
		path: LOGIN_PAGE,
		query: { redirect: normalizedPath },
	});
});
export default router;
