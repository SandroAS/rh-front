import type Evaluation from './evaluation.type';

export default interface EvaluationResponsePagination {
  data: Evaluation[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
