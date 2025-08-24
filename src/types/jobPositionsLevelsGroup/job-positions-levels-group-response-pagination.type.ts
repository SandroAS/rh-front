import type JobPositionsLevelsGroup from './job-positions-levels-group.type';

export default interface JobPositionsLevelsGroupResponsePagination {
  data: JobPositionsLevelsGroup[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
