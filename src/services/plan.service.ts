import type { PlanResponse } from '@/types/plan/plan-response.type';
import type { AxiosResponse } from 'axios';
import api from './api.service';

export const getPlans = async (): Promise<PlanResponse[]> => {
  const response: AxiosResponse<PlanResponse[]> = await api.get('/plans');
  return response.data;
};

export const getPlanByUuid = async (uuid: string): Promise<PlanResponse> => {
  const response: AxiosResponse<PlanResponse> = await api.get(`/plans/${uuid}`);
  return response.data;
};
