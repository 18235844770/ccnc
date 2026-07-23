import { IHttpResponse } from "@/utils/interface";
import { request } from "@/utils/request";
const VITE_API_HOST = import.meta.env.VITE_API_HOST;

// POST 请求示例
export function fetchPostTest(data: any) {
	return request<IHttpResponse>({
		url: `${VITE_API_HOST}/xxx`,
		method: "POST",
		data,
	});
}

// GET 请求示例
export function fetchGetTest(params?: any) {
	return request<IHttpResponse>({
		url: `${VITE_API_HOST}/xxx`,
		method: "GET",
		params,
	});
}

// 文件上传 请求示例
export function fetchFilePostTest(params: any) {
	return request<IHttpResponse>({
		url: `${VITE_API_HOST}/xxx`,
		method: "POST",
		params: {
			fileUploadRequset: true,
			...params,
		},
	});
}
