import type { EvaluationApplication } from './evaluation-application.type';

export default interface EvaluationApplicationResponsePagination {
  data: EvaluationApplication[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
