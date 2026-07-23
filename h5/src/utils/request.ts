import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { UniAdapter } from "uniapp-axios-adapter";
import { handleMockDataReturn } from "./commom";
import { useUserStore } from "@/store/user";

const VITE_API_HOST = import.meta.env.VITE_API_HOST || "";

const instance = axios.create({
	baseURL: VITE_API_HOST,
	timeout: 30 * 1000,
	adapter: UniAdapter,
});

const transformFromData = (data: { [key: string]: string }) => {
	const formData = new FormData();
	for (const key in data) {
		data[key] && formData.append(key, data[key]);
	}
	return formData;
};

// 请求拦截
instance.interceptors.request.use(
	(config: AxiosRequestConfig) => {
		// 根据参数判断是否是文件上传，修改 Content-Type
		if (config?.data?.fileUploadRequset) {
			config.data = transformFromData(config.data);
			if (!config.headers) config.headers = {};
			config.headers["Content-Type"] = "multipart/form-data;charset=utf-8";
		}
		if (!config.headers) config.headers = {};
		// 在拦截器内获取 store，避免模块加载时 pinia 未初始化
		const userStore = useUserStore();
		if (userStore.token) {
			config.headers.Authorization = `Bearer ${userStore.token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 响应拦截
instance.interceptors.response.use(
	(res) => {
		if (
			res.data.code !== undefined &&
			res.data.code !== 0 &&
			res.data.code !== 200 &&
			!(res.config as AxiosRequestConfig & { skipErrorHandler?: boolean }).skipErrorHandler
		) {
			uni.showToast({
				title: res.data.msg || res.data.message || "",
				icon: "none",
			});
			return Promise.reject(res.data);
		}
		return Promise.resolve(res.data);
	},
	(error: AxiosError<{ code: number; message?: string; msg?: string }>) => {
		// 处理mock，直接返回数据
		if (error.config?.url?.includes("/mock")) {
			const returnData = handleMockDataReturn(error.config.url || "") || "";
			console.log("mock 数据结果：", returnData);
			return Promise.resolve(returnData);
		}

		const skipErrorHandler = (error.config as AxiosRequestConfig & { skipErrorHandler?: boolean }).skipErrorHandler;
		if (error.response?.status === 401 && !skipErrorHandler) {
			const userStore = useUserStore();
			userStore.logout();
			uni.showToast({
				title: "登录已过期，请重新登录",
				icon: "none",
			});
			// 跳转登录页（若当前不在登录页）
			setTimeout(() => {
				const pages = getCurrentPages();
				const curPage = pages[pages.length - 1];
				const route = (curPage as any)?.route || "";
				if (route && !route.includes("login")) {
					uni.navigateTo({ url: "/pages/login/index" });
				}
			}, 500);
			return Promise.reject(error);
		}
		if (!skipErrorHandler) {
			uni.showToast({
				title: error.response?.data?.message || error.response?.data?.msg || error.message || "",
				icon: "none",
			});
		}
		return Promise.reject(error);
	}
);

type Request = <T = unknown>(config: AxiosRequestConfig & { skipErrorHandler?: boolean }) => Promise<T>;

export const request = instance.request as Request;
