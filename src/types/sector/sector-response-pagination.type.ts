import type Sector from './sector.type';

export default interface SectorResponsePagination {
  data: Sector[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
