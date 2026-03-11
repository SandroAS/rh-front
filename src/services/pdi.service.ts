import type { AxiosResponse } from 'axios';
import api from './api.service';
import type Pdi from '@/types/pdi/pdi.type';
import type PdiPayload from '@/types/pdi/pdi-payload.type';
import type PdiResponsePagination from '@/types/pdi/pdi-response-pagination.type';

export const getPdis = async (
  page: number = 1,
  limit: number = 10,
  sortColumn?: string,
  sortOrder?: 'asc' | 'desc',
  searchTerm?: string
): Promise<PdiResponsePagination> => {
  const params: Record<string, unknown> = { page, limit };
  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<PdiResponsePagination> = await api.get('/pdis/pagination', { params });
  return response.data;
};

export const getPdisByUserUuid = async (userUuid: string): Promise<Pdi[]> => {
  const response: AxiosResponse<Pdi[]> = await api.get(`/pdis/user/${userUuid}`);
  return response.data;
};

export const getPdi = async (uuid: string): Promise<Pdi> => {
  const response: AxiosResponse<Pdi> = await api.get(`/pdis/${uuid}`);
  return response.data;
};

export const getAllPdis = async (): Promise<Pdi[]> => {
  const response: AxiosResponse<Pdi[]> = await api.get('/pdis');
  return response.data;
};

export const savePdi = async (payload: PdiPayload, uuid?: string): Promise<Pdi> => {
  const response: AxiosResponse<Pdi> = uuid
    ? await api.put(`/pdis/${uuid}`, payload)
    : await api.post('/pdis', payload);
  return response.data;
};

export const removePdi = async (uuid: string): Promise<boolean> => {
  const response: AxiosResponse<boolean> = await api.delete(`/pdis/${uuid}`);
  return response.data;
};
