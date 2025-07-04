import type { AxiosResponse } from 'axios';
import api from './api.service';
import type ServicePayload from '@/types/service/service-payload.type';
import type ServiceResponsePagination from '@/types/service/service-response-pagination.type';

export const getServices = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<ServiceResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<ServiceResponsePagination> = await api.get('/services', { params });

  return response.data;
};

export const saveService = async (service: ServicePayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/services/${uuid}`, { ...service, system_module_uuid: service.systemModule!.uuid })
    : await api.post('/services', { ...service, system_module_uuid: service.systemModule!.uuid });
  return response.data;
};

export const removeService = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/services/${uuid}`);
  return response.data;
};
