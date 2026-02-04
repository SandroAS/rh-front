import type { AxiosResponse } from 'axios';
import api from './api.service';
import type SectorResponsePagination from '@/types/sector/sector-response-pagination.type';
import type SectorPayload from '@/types/sector/sector-payload.type';


export const getSectors = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<SectorResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<SectorResponsePagination> = await api.get('/sectors/pagination', { params });

  return response.data;
};

import type Sector from '@/types/sector/sector.type';

export const saveSector = async (sector: SectorPayload, uuid?: string) => {
  const response: AxiosResponse<Sector> = uuid 
    ? await api.put(`/sectors/${uuid}`, sector)
    : await api.post('/sectors', sector);
  return response.data;
};

export const removeSector = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/sectors/${uuid}`);
  return response.data;
};
