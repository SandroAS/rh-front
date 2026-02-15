import type { TrialResponse } from '@/types/account/trial-response.type';
import { type AxiosResponse } from 'axios';
import api from './api.service';

export const getMyTrial = async (): Promise<TrialResponse> => {
  const response: AxiosResponse<TrialResponse> = await api.get('/trials/my-trial');
  return response.data;
};
