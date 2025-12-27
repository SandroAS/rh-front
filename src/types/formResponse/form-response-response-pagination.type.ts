import type FormResponse from './form-response.type';

export default interface FormResponseResponsePagination {
  data: FormResponse[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
