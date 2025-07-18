import type Team from './team.type';

export default interface TeamResponsePagination {
  data: Team[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
