import type LevelsGroup from './levels-group.type';

export default interface LevelsGroupResponsePagination {
  data: LevelsGroup[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
