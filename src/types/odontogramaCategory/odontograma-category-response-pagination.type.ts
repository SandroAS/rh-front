import type OdontogramaCategory from './odontograma-category.type';

export default interface OdontogramaCategoryResponsePagination {
  data: OdontogramaCategory[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
