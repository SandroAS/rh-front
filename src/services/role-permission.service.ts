import type { AxiosResponse } from 'axios';
import api from './api.service';
import type RoleResponsePaginationDto from '@/types/role/role-response-pagination.type';

export const getRolesPermissions = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<RoleResponsePaginationDto> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<RoleResponsePaginationDto> = await api.get('/roles', { params });

  return response.data;
};

export const getAllPermissions = async (): Promise<string[]> => {
  const response: AxiosResponse<string[]> = await api.get('/permissions');
  return response.data;
};
