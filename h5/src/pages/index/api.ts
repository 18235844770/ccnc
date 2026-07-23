import { IHttpResponse } from "@/utils/interface";
import { request } from "@/utils/request";
// POST 请求示例
export function fetchPostTest(data: any) {
	return request<IHttpResponse>({
		url: `/xxx`,
		method: "POST",
		data,
	});
}

// GET 请求示例
export function fetchGetTest(params?: any) {
	return request<IHttpResponse>({
		url: `/xxx`,
		method: "GET",
		params,
	});
}

// 文件上传 请求示例
export function fetchFilePostTest(params: any) {
	return request<IHttpResponse>({
		url: `/xxx`,
		method: "POST",
		params: {
			fileUploadRequset: true,
			...params,
		},
	});
}
/**
 * @description这个接口是mock接口，在utils/request.ts 和utils/commom.ts中配置了mock请求，监听请求中的路径是否有mock，会直接返回mock数据
 * @returns
 */
// mock 请求示例
export function fetchMockTest() {
	return request<IHttpResponse>({
		url: `/mock/getMockData`,
		method: "GET",
	});
}
