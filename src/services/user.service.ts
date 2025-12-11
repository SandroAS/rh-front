import type { AxiosResponse } from 'axios';
import api from './api.service';
import type { UserAvatar } from '@/types/user/user-avatar.type';
import type { UserTeam } from '@/types/user/user-team.type';

export const getAllAccountUsers = async (): Promise<UserAvatar[]> => {
  const response: AxiosResponse<UserAvatar[]> = await api.get('/users');
  return response.data;
};

export const getAllAccountUsersWithTeams = async (): Promise<UserTeam[]> => {
  const response: AxiosResponse<UserTeam[]> = await api.get('/users/with-teams');
  return response.data;
};
