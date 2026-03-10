import type { AxiosResponse } from 'axios';
import api from './api.service';
import type PdiCategory from '@/types/pdi/pdi-category.type';
import type PdiCategoryPayload from '@/types/pdi/pdi-category-payload.type';
import type PdiCategoryResponsePagination from '@/types/pdi/pdi-category-response-pagination.type';

export const getPdiCategories = async (
  page: number = 1,
  limit: number = 10,
  sortColumn?: string,
  sortOrder?: 'asc' | 'desc',
  searchTerm?: string
): Promise<PdiCategoryResponsePagination> => {
  const params: Record<string, unknown> = { page, limit };
  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<PdiCategoryResponsePagination> = await api.get('/pdi-categories/pagination', { params });
  return response.data;
};

export const getPdiCategory = async (uuid: string): Promise<PdiCategory> => {
  const response: AxiosResponse<PdiCategory> = await api.get(`/pdi-categories/${uuid}`);
  return response.data;
};

export const getAllPdiCategories = async (): Promise<PdiCategory[]> => {
  const response: AxiosResponse<PdiCategory[]> = await api.get('/pdi-categories');
  return response.data;
};

export const savePdiCategory = async (payload: PdiCategoryPayload, uuid?: string): Promise<PdiCategory> => {
  const response: AxiosResponse<PdiCategory> = uuid
    ? await api.put(`/pdi-categories/${uuid}`, payload)
    : await api.post('/pdi-categories', payload);
  return response.data;
};

export const removePdiCategory = async (uuid: string): Promise<boolean> => {
  const response: AxiosResponse<boolean> = await api.delete(`/pdi-categories/${uuid}`);
  return response.data;
};
