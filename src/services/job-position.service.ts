import type { AxiosResponse } from 'axios';
import api from './api.service';
import type JobPositionPayload from '@/types/jobPosition/job-position-payload.type';
import type JobPositionResponsePagination from '@/types/jobPosition/job-position-response-pagination.type';

export const getJobPositions = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<JobPositionResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<JobPositionResponsePagination> = await api.get('/job-positions', { params });

  return response.data;
};

export const saveJobPosition = async (service: JobPositionPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/job-positions/${uuid}`, { ...service, system_module_uuid: service.levelsGroup!.uuid })
    : await api.post('/job-positions', { ...service, system_module_uuid: service.levelsGroup!.uuid });
  return response.data;
};

export const removeJobPosition = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/job-positions/${uuid}`);
  return response.data;
};
