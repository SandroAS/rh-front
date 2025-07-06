import type JobPosition from './job-position.type';

export default interface JobPositionResponsePagination {
  data: JobPosition[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
