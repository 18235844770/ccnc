/**
 * 内容展示 API（无需登录）
 * 参考 docs/mobile_api.md 一、内容展示
 */
import { request } from "@/utils/request";

/** Banner 项 */
export interface BannerItem {
	id: number;
	title: string;
	image_url: string;
	link_url?: string;
	status: string;
	sort_order: number;
	start_time?: string;
	end_time?: string;
	created_at?: string;
	updated_at?: string;
}

/** 文章列表项 */
export interface ArticleItem {
	id: number;
	title: string;
	tags?: string;
	description?: string;
	publish_time?: string;
	cover_image?: string;
	status?: string;
	sort_order?: number;
	view_count?: number;
	created_at?: string;
	updated_at?: string;
}

/** 文章详情（含正文） */
export interface ArticleDetail extends ArticleItem {
	content?: string;
}

/** 分页列表响应 */
export interface PageListResponse<T> {
	total: number;
	records: T[];
}

/**
 * 获取 Banner 轮播列表
 * GET /api/v1/banners
 */
export function fetchBanners() {
	return request<BannerItem[]>({
		url: "/banners",
		method: "GET",
	});
}

/**
 * 获取文章列表
 * GET /api/v1/articles
 */
export function fetchArticles(params?: { page?: number; page_size?: number }) {
	return request<{ total: number; records: ArticleItem[] }>({
		url: "/articles",
		method: "GET",
		params,
	});
}

/**
 * 获取文章详情
 * GET /api/v1/articles/:id
 */
export function fetchArticleDetail(id: number | string) {
	return request<ArticleDetail>({
		url: `/articles/${id}`,
		method: "GET",
	});
}
