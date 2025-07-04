import type { AxiosResponse } from 'axios';
import api from './api.service';
import type { SystemModule } from '@/types/systemModule/system-module.type';

export const getSystemModules = async (): Promise<SystemModule[]> => {
  const response: AxiosResponse<SystemModule[]> = await api.get('/system-modules');
  return response.data;
};
