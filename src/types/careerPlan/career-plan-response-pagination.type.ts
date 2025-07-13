import type CareerPlan from './career-plan.type';

export default interface CareerPlanResponsePagination {
  data: CareerPlan[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
