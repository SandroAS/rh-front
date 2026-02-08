import type { AxiosResponse } from 'axios';
import api from './api.service';
import type AccountUserPayload from '@/types/account/account-user-payload.type';
import type AccountUsersResponsePaginationDto from '@/types/account/account-users-response-pagination-dto';
import type AccountUsersTotals from '@/types/dashboard/account-users-totals.type';

export const getAccountUsers = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<AccountUsersResponsePaginationDto> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<AccountUsersResponsePaginationDto> = await api.get('/account/pagination', { params });
  return response.data;
};

export const getTotalAccountUsers = async (): Promise<AccountUsersTotals> => {
  const response: AxiosResponse<AccountUsersTotals> = await api.get('/account/users/totals');
  return response.data;
};

export const saveAccountUser = async (accountUser: AccountUserPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string, role: { uuid: string } }> = uuid 
    ? await api.put(`/account/users/${uuid}`, accountUser)
    : await api.post('/account/users', accountUser);
  return response.data;
};

export const updateAccountUserIsActive = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.patch(`/account/users/is-active/${uuid}`);
  return response.data;
};
