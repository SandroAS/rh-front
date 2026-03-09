import type { AxiosResponse } from 'axios';
import api from './api.service';
import type { SyncUserMetricsDto } from '@/types/user/user-metric.type';

export const saveUserMetrics = async (payload: SyncUserMetricsDto): Promise<unknown> => {
  const response: AxiosResponse<unknown> = await api.post('/user-metrics', payload);
  return response.data;
};
