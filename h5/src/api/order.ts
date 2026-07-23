/**
 * 订单 API（需登录）
 * 参考 docs/mobile_api.md 四、订单
 */
import { request } from "@/utils/request";

/** 创建订单参数 */
export interface CreateOrderParams {
	product_id: number;
	amount: number;
}

/** 创建订单响应 */
export interface CreateOrderResponse {
	order_id: number;
}

/** 支付订单参数 */
export interface PayOrderParams {
	payment_method: "ALIPAY" | "BALANCE";
	payment_amount: number;
}

/** 支付订单响应（支付宝网页支付返回跳转 URL） */
export interface PayOrderResponse {
	pay_url?: string;
	redirect_url?: string;
}

/** 订单项（列表/详情） */
export interface OrderItem {
	id?: number;
	order_id?: number;
	order_no?: string;
	user_id?: number;
	product_id?: number;
	product_name?: string;
	amount?: number;
	status?: string;
	payment_method?: string;
	created_at?: string;
	paid_at?: string;
	[key: string]: any;
}

/**
 * 创建订单
 * POST /api/v1/orders
 */
export function createOrder(data: CreateOrderParams) {
	return request<{ order_id: number }>({
		url: "/orders",
		method: "POST",
		data,
	});
}

/**
 * 支付订单（支付宝网页支付）
 * POST /api/v1/orders/:order_id/pay
 */
export function payOrder(orderId: number | string, data: PayOrderParams) {
	return request<PayOrderResponse>({
		url: `/orders/${orderId}/pay`,
		method: "POST",
		data,
	});
}

/**
 * 订单列表（扩展接口，需后端支持 GET /orders）
 * GET /api/v1/orders?user_id=xxx&page=1&page_size=20
 */
export function fetchOrderList(params?: { page?: number; page_size?: number; status?: string }) {
	return request<{ total: number; records: OrderItem[] }>({
		url: "/orders",
		method: "GET",
		params,
	});
}

/**
 * 订单详情
 * GET /api/v1/orders/:order_id
 */
export function fetchOrderDetail(orderId: number | string) {
	return request<OrderItem>({
		url: `/orders/${orderId}`,
		method: "GET",
	});
}

/**
 * 取消订单
 * POST /api/v1/orders/:order_id/cancel
 */
export function cancelOrder(orderId: number | string) {
	return request({
		url: `/orders/${orderId}/cancel`,
		method: "POST",
	});
}

/**
 * 申请退款
 * POST /api/v1/orders/:order_id/refund
 */
export function refundOrder(orderId: number | string) {
	return request({
		url: `/orders/${orderId}/refund`,
		method: "POST",
	});
}
