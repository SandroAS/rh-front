import type { AxiosResponse } from 'axios';
import api from './api.service';
import type EvaluationApplicationResponsePagination from '@/types/evaluationApplication/evaluation-application-response-pagination.type';
import type EvaluationApplicationPayload from '@/types/evaluationApplication/evaluation-application-payload.type';

export async function getEvaluationApplications(
  page: number = 1,
  limit: number = 10,
  sortColumn?: string,
  sortOrder?: 'asc' | 'desc',
  searchTerm?: string
): Promise<EvaluationApplicationResponsePagination> {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<EvaluationApplicationResponsePagination> = await api.get('/evaluation-applications/pagination', { params });
  return response.data;
}

export async function saveEvaluationApplication(
  payload: EvaluationApplicationPayload,
  uuid?: string
): Promise<{ uuid: string }> {
  const response: AxiosResponse<{ uuid: string }> = uuid
    ? await api.put(`/evaluation-applications/${uuid}`, payload)
    : await api.post('/evaluation-applications', payload);
  return response.data;
}

export async function deleteEvaluationApplication(uuid: string): Promise<void> {
  await api.delete(`/evaluation-applications/${uuid}`);
}
