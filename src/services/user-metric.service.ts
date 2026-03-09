import type { AxiosResponse } from 'axios';
import api from './api.service';
import type { SyncUserMetricsDto, UserMetricResponseDto } from '@/types/user/user-metric.type';

export const saveUserMetrics = async (payload: SyncUserMetricsDto): Promise<unknown> => {
  const response: AxiosResponse<unknown> = await api.post('/user-metrics', payload);
  return response.data;
};

export const getUserMetricsByUserUuid = async (
  userUuid: string
): Promise<UserMetricResponseDto[]> => {
  const response: AxiosResponse<UserMetricResponseDto[]> = await api.get(
    `/user-metrics/user/${userUuid}`
  );
  return response.data;
};
