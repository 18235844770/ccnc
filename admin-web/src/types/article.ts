// Article Management Types

export type ArticleStatus = 'DRAFT' | 'PUBLISHED';

export interface Article {
  id: number;
  title: string;
  tags?: string;
  description?: string;
  publish_time?: string | null;
  cover_image?: string;
  content?: string;
  status: ArticleStatus;
  sort_order: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleQueryParams {
  page?: number;
  page_size?: number;
  status?: ArticleStatus;
}

export interface ArticleListResult {
  total: number;
  records: Article[];
}

export interface CreateArticleData {
  title: string;
  tags?: string;
  description?: string;
  publish_time?: string;
  cover_image?: string;
  content?: string;
  status?: ArticleStatus;
  sort_order?: number;
}

export type UpdateArticleData = Partial<CreateArticleData>;
