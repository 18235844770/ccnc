import request from '@/utils/request';
import type {
  Banner,
  BannerQueryParams,
  BannerListResult,
  CreateBannerData,
  UpdateBannerData,
} from '@/types/banner';

export function getBannerList(params?: BannerQueryParams) {
  return request.get<BannerListResult>('/admin/banners', params);
}

export function getBannerDetail(id: number) {
  return request.get<Banner>(`/admin/banners/${id}`);
}

export function createBanner(data: CreateBannerData) {
  return request.post<Banner>('/admin/banners', data);
}

export function updateBanner(id: number, data: UpdateBannerData) {
  return request.put(`/admin/banners/${id}`, data);
}

export function deleteBanner(id: number) {
  return request.delete(`/admin/banners/${id}`);
}
