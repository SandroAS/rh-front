import type Notification from './notification.type';

export default interface NotificationResponsePagination {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}
