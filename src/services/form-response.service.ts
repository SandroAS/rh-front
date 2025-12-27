import type { AxiosResponse } from 'axios';
import api from './api.service';
import type FormResponse from '@/types/formResponse/form-response.type';
import type FormResponseResponsePagination from '@/types/formResponse/form-response-response-pagination.type';
import type FormResponsePayload from '@/types/formResponse/form-response-payload.type';

export const getFormResponses = async (): Promise<FormResponse[]> => {
  const response: AxiosResponse<FormResponse[]> = await api.get('/form-response-groups');
  return response.data;
};

export const getFormResponsesPagination = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<FormResponseResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<FormResponseResponsePagination> = await api.get('/form-response/pagination', { params });

  return response.data;
};

export const saveFormResponse = async (levelsGroup: FormResponsePayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/form-responses/${uuid}`, levelsGroup)
    : await api.post('/form-responses', levelsGroup);
  return response.data;
};

export const removeFormResponse = async (uuid: string) => {
  const response: AxiosResponse<boolean> = await api.delete(`/form-response/${uuid}`);
  return response.data;
};

/**
 * Envia as respostas de uma aplicação de avaliação específica
 * @param evaluationApplicationUuid UUID da EvaluationApplication
 * @param payload Objeto contendo is_completed e o array de respostas
 */
export async function submitFormAnswers(evaluationApplicationUuid: string, payload: FormResponsePayload): Promise<void> {
  await api.post(`/form-responses/submit/${evaluationApplicationUuid}`, payload);
}
