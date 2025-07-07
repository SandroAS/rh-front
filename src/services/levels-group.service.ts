import type { AxiosResponse } from 'axios';
import api from './api.service';
import type LevelsGroup from '@/types/levelsGroup/levels-group.type';
import type LevelsGroupResponsePagination from '@/types/levelsGroup/levels-group-response-pagination.type';
import type LevelsGroupPayload from '@/types/levelsGroup/levels-group-payload.type';

export const getLevelsGroups = async (): Promise<LevelsGroup[]> => {
  const response: AxiosResponse<LevelsGroup[]> = await api.get('/levels-groups');
  return response.data;
};

export const getLevelsGroupsPagination = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<LevelsGroupResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<LevelsGroupResponsePagination> = await api.get('/levels-groups/pagination', { params });

  return response.data;
};

export const saveLevelsGroup = async (levelsGroup: LevelsGroupPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/levels-groups/${uuid}`, levelsGroup)
    : await api.post('/levels-groups', levelsGroup);
  return response.data;
};

export const removeLevelsGroup = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/levels-groups/${uuid}`);
  return response.data;
};
