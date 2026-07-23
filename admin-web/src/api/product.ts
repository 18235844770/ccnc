import request from '@/utils/request';
import type { Product, ProductQueryParams, ProductListResult, CreateProductData, UpdateProductData } from '@/types/product';

export function getProductList(params: ProductQueryParams) {
  return request.get<ProductListResult>('/admin/products', params);
}

export function getProductDetail(id: number) {
  return request.get<Product>(`/admin/products/${id}`);
}

export function createProduct(data: CreateProductData) {
  return request.post('/admin/products', data);
}

export function updateProduct(id: number, data: UpdateProductData) {
  return request.put(`/admin/products/${id}`, data);
}

export function deleteProduct(id: number) {
  return request.delete(`/admin/products/${id}`);
}
