import type { AxiosResponse } from 'axios';
import api from './api.service';
import type { UserAvatar } from '@/types/user/user-avatar.type';

export const getAllAccountUsers = async (): Promise<UserAvatar[]> => {
  const response: AxiosResponse<UserAvatar[]> = await api.get('/users');
  return response.data;
};
