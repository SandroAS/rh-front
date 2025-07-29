import type { AxiosResponse } from 'axios';
import api from './api.service';
import type EvaluationPayload from '@/types/evaluation/evaluation-payload.type';
import type EvaluationResponsePagination from '@/types/evaluation/evaluation-response-pagination.type';

export const getEvaluations = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<EvaluationResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<EvaluationResponsePagination> = await api.get('/evaluations', { params });

  return response.data;
};

export const saveEvaluation = async (evaluation: EvaluationPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/evaluations/${uuid}`, evaluation)
    : await api.post('/evaluations', evaluation);
  return response.data;
};

export const removeEvaluation = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/evaluations/${uuid}`);
  return response.data;
};
