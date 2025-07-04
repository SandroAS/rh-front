import type Service from './service.type';

export default interface ServiceResponsePagination {
  data: Service[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
