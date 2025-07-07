import type { AxiosResponse } from 'axios';
import api from './api.service';
import type Level from '@/types/level/level.type';

export const getLevels = async (): Promise<Level[]> => {
  const response: AxiosResponse<Level[]> = await api.get('/levels');
  return response.data;
};
