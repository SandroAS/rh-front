import type { AxiosResponse } from 'axios';
import api from './api.service';
import type { UserAvatar } from '@/types/user/user-avatar.type';
import type { UserTeam } from '@/types/user/user-team.type';
import type { UserPanel } from '@/types/user/user-panel.type';

export const getAllAccountUsers = async (): Promise<UserAvatar[]> => {
  const response: AxiosResponse<UserAvatar[]> = await api.get('/users');
  return response.data;
};

export const getAllAccountUsersWithTeams = async (): Promise<UserTeam[]> => {
  const response: AxiosResponse<UserTeam[]> = await api.get('/users/with-teams');
  return response.data;
};

export const getUserPanel = async (uuid: string): Promise<UserPanel> => {
  const response: AxiosResponse<UserPanel> = await api.get(`/users/${uuid}/user-panel`);
  return response.data;
};