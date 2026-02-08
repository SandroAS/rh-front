import type { AxiosResponse } from 'axios';
import api from './api.service';
import type TeamPayload from '@/types/team/team-payload.type';
import type TeamResponsePagination from '@/types/team/team-response-pagination.type';
import type TeamMember from '@/types/teamMember/teamMember.type';
import type TeamsTotals from '@/types/dashboard/teams-totals.type';

export const getTeams = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<TeamResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<TeamResponsePagination> = await api.get('/teams/pagination', { params });

  return response.data;
};

export const saveTeam = async (team: TeamPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string, teamMembers: TeamMember[] }> = uuid 
    ? await api.put(`/teams/${uuid}`, team)
    : await api.post('/teams', team);
  return response.data;
};

export const removeTeam = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/teams/${uuid}`);
  return response.data;
};

export const getTotalTeams = async (): Promise<TeamsTotals> => {
  const response: AxiosResponse<TeamsTotals> = await api.get('/teams/totals');
  return response.data;
};
