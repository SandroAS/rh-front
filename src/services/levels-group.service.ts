import type { AxiosResponse } from 'axios';
import api from './api.service';
import type LevelsGroup from '@/types/levelsGroup/levels-group.type';

export const getLevelsGroups = async (): Promise<LevelsGroup[]> => {
  const response: AxiosResponse<LevelsGroup[]> = await api.get('/levels-groups');
  return response.data;
};
