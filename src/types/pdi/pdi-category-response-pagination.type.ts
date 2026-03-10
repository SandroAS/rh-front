import type PdiCategory from './pdi-category.type';

export default interface PdiCategoryResponsePagination {
  data: PdiCategory[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
