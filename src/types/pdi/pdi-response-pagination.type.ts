import type Pdi from './pdi.type';

export default interface PdiResponsePagination {
  data: Pdi[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
