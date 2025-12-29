import type { AxiosResponse } from 'axios';
import api from './api.service';
import type EvaluationApplicationResponsePagination from '@/types/evaluationApplication/evaluation-application-response-pagination.type';
import { type EvaluationApplicationPayload } from '@/types/evaluationApplication/evaluation-application-payload.type';
import { EvaluationType, type EvaluationApplication, type EvaluationApplicationForm } from '@/types/evaluationApplication/evaluation-application.type';

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

export const getEvaluationApplication = async (uuid: string): Promise<EvaluationApplicationForm> => {
  const response: AxiosResponse<EvaluationApplicationForm> = await api.get(`/evaluation-applications/${uuid}`);
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

export async function getEvaluationApplicationsFilterMetrics(
  name?: string | null,
  type?: EvaluationType | null,
  evaluated_user_uuid?: string | null,
  submitted_user_uuid?: string | null,
  start_date?: string | null,
  end_date?: string | null
): Promise<EvaluationApplication[]> {
  const params: any = {};
  if (name) params.name = name;
  if (type) params.type = type;
  if (evaluated_user_uuid) params.evaluated_user_uuid = evaluated_user_uuid;
  if (submitted_user_uuid) params.submitted_user_uuid = submitted_user_uuid;
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  const response: AxiosResponse<EvaluationApplication[]> = await api.get('/evaluation-applications/metrics', { params });
  return response.data;
}

export async function deleteEvaluationApplication(uuid: string): Promise<void> {
  await api.delete(`/evaluation-applications/${uuid}`);
}
