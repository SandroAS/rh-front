import type { Role } from './role.type';

export default interface RoleResponsePaginationDto {
  data: Role[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
