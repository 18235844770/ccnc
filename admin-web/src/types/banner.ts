// Banner Management Types

export type BannerStatus = 'ACTIVE' | 'INACTIVE';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url?: string;
  status: BannerStatus;
  sort_order: number;
  start_time?: string | null;
  end_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BannerQueryParams {
  page?: number;
  page_size?: number;
  status?: BannerStatus;
}

export interface BannerListResult {
  total: number;
  records: Banner[];
}

export interface CreateBannerData {
  title: string;
  image_url: string;
  link_url?: string;
  status?: BannerStatus;
  sort_order?: number;
  start_time?: string;
  end_time?: string;
}

export type UpdateBannerData = Partial<CreateBannerData>;
