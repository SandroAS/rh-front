import type DRD from './drd.type';

export default interface DRDResponsePagination {
  data: DRD[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
