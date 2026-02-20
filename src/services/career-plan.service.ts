import type { AxiosResponse } from 'axios';
import api from './api.service';
import type CareerPlanPayload from '@/types/careerPlan/career-plan-payload.type';
import type CareerPlanResponsePagination from '@/types/careerPlan/career-plan-response-pagination.type';
import type CareerPlan from '@/types/careerPlan/career-plan.type';

/** Ordena careerPlanJobPositions pela coluna order (asc). */
function sortCareerPlanJobPositions(plan: CareerPlan): CareerPlan {
  if (!plan.careerPlanJobPositions?.length) return plan;
  return {
    ...plan,
    careerPlanJobPositions: [...plan.careerPlanJobPositions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
}

export const getCareerPlansPagination = async (page: number = 1, limit: number = 10, sortColumn?: string, sortOrder?: 'asc' | 'desc', searchTerm?: string): Promise<CareerPlanResponsePagination> => {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<CareerPlanResponsePagination> = await api.get('/career-plans/pagination', { params });
  const data = response.data;
  data.data = (data.data ?? []).map(sortCareerPlanJobPositions);
  return data;
};

export const getAllCareerPlans = async (): Promise<CareerPlan[]> => {
  const response: AxiosResponse<CareerPlan[]> = await api.get('/career-plans');
  return (response.data ?? []).map(sortCareerPlanJobPositions);
};

export const getCareerPlanByUuid = async (uuid: string): Promise<CareerPlan> => {
  const response: AxiosResponse<CareerPlan> = await api.get(`/career-plans/${uuid}`);
  return sortCareerPlanJobPositions(response.data);
};

export const saveCareerPlan = async (careerPlan: CareerPlanPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/career-plans/${uuid}`, careerPlan)
    : await api.post('/career-plans', careerPlan);
  return response.data;
};

export const removeCareerPlan = async (uuid: string): Promise<void> => {
  await api.delete(`/career-plans/${uuid}`);
};
