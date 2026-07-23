import request from '@/utils/request';
import type {
  Article,
  ArticleQueryParams,
  ArticleListResult,
  CreateArticleData,
  UpdateArticleData,
} from '@/types/article';

export function getArticleList(params?: ArticleQueryParams) {
  return request.get<ArticleListResult>('/admin/articles', params);
}

export function getArticleDetail(id: number) {
  return request.get<Article>(`/admin/articles/${id}`);
}

export function createArticle(data: CreateArticleData) {
  return request.post<Article>('/admin/articles', data);
}

export function updateArticle(id: number, data: UpdateArticleData) {
  return request.put(`/admin/articles/${id}`, data);
}

export function deleteArticle(id: number) {
  return request.delete(`/admin/articles/${id}`);
}
