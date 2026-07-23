/**
 * 理财产品 API（需登录）
 * 参考 docs/mobile_api.md 三、理财产品
 */
import { request } from "@/utils/request";

/** 产品项 */
export interface ProductItem {
	id: number;
	name: string;
	description?: string;
	yield_rate?: number;
	cycle_days?: number;
	min_amount?: number;
	status?: string;
	rule_version?: string;
	created_at?: string;
	updated_at?: string;
}

/**
 * 获取产品列表
 * GET /api/v1/products
 */
export function fetchProducts(params?: {
	page?: number;
	page_size?: number;
	status?: string;
}) {
	return request<{ total: number; records: ProductItem[] }>({
		url: "/products",
		method: "GET",
		params,
	});
}

/**
 * 获取产品详情
 * GET /api/v1/products/:id
 */
export function fetchProductDetail(id: number | string) {
	return request<ProductItem>({
		url: `/products/${id}`,
		method: "GET",
	});
}
