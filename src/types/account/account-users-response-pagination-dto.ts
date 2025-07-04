import type AccountUser from './account-user.type';

export default interface AccountUsersResponsePaginationDto {
  users: AccountUser[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
