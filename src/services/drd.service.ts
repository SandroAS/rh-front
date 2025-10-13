import type { AxiosResponse } from 'axios';
import api from './api.service';
import type DRDPayload from '@/types/drd/drd-payload.type';
import type DRDResponsePagination from '@/types/drd/drd-response-pagination.type';

export const getDRDs = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<DRDResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<DRDResponsePagination> = await api.get('/drds/pagination', { params });

  return response.data;
};

export const saveDRD = async (drd: DRDPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/drds/${uuid}`, drd)
    : await api.post('/drds', drd);
  return response.data;
};

export const removeDRD = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/drds/${uuid}`);
  return response.data;
};
