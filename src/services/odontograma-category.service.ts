import type { AxiosResponse } from 'axios';
import api from './api.service';
import type OdontogramaCategoryResponsePagination from '@/types/odontogramaCategory/odontograma-category-response-pagination.type';
import type OdontogramaCategoryPayload from '@/types/odontogramaCategory/odontograma-category-payload.type';

export const getOdontogramaCategories = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<OdontogramaCategoryResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<OdontogramaCategoryResponsePagination> = await api.get('/odontograma-categories', { params });

  return response.data;
};

export const saveOdontogramaCategory = async (odontogramaCategory: OdontogramaCategoryPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/odontograma-categories/${uuid}`, odontogramaCategory)
    : await api.post('/odontograma-categories', odontogramaCategory);
  return response.data;
};

export const removeOdontogramaCategory = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/odontograma-categories/${uuid}`);
  return response.data;
};
