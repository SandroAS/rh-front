import type { AxiosResponse } from 'axios';
import api from './api.service';
import type EvaluationApplicationResponsePagination from '@/types/evaluationApplication/evaluation-application-response-pagination.type';
import { type CreateEvaluationApplication, type EvaluationApplicationPayload } from '@/types/evaluationApplication/evaluation-application-payload.type';
import { type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';

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

export const getEvaluationApplication = async (uuid: string): Promise<EvaluationApplication> => {
  const response: AxiosResponse<EvaluationApplication> = await api.get(`/evaluation-applications/${uuid}`);
  return response.data;
};

export async function createEvaluationApplication(
  payload: EvaluationApplicationPayload,
): Promise<EvaluationApplication[]> {
  const response: AxiosResponse<EvaluationApplication[]> = await api.post('/evaluation-applications', payload);
  return response.data;
}

export async function updateEvaluationApplication(
  payload: EvaluationApplicationPayload,
  uuid: string
): Promise<EvaluationApplication> {
  const response: AxiosResponse<EvaluationApplication> = await api.put(`/evaluation-applications/${uuid}`, payload)
  return response.data;
}

export async function cancelEvaluationApplication(uuid: string): Promise<void> {
  await api.patch(`/evaluation-applications/cancel/${uuid}`);
}

export async function sendEvaluationApplication(uuid: string, forEmail: boolean, forSystem: boolean): Promise<void> {
  await api.post(`/evaluation-applications/send/${uuid}`, { forEmail, forSystem });
}

export async function deleteEvaluationApplication(uuid: string): Promise<void> {
  await api.delete(`/evaluation-applications/${uuid}`);
}
