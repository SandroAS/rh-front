import type { AxiosResponse } from 'axios';
import api from './api.service';
import type Notification from '@/types/notification/notification.type';
import type NotificationPayload from '@/types/notification/notification-payload.type';
import type NotificationResponsePagination from '@/types/notification/notification-response-pagination.type';


export async function getNotifications(
  page: number = 1,
  limit: number = 10,
  sortColumn?: string,
  sortOrder?: 'asc' | 'desc',
  searchTerm?: string
): Promise<NotificationResponsePagination> {
  const params: any = { page, limit };

  if (sortColumn) params.sort_column = sortColumn;
  if (sortOrder) params.sort_order = sortOrder;
  if (searchTerm) params.search_term = searchTerm;

  const response: AxiosResponse<NotificationResponsePagination> = await api.get('/notifications/pagination', { params });
  return response.data;
}

export const markAllAsReadNotifications = async (): Promise<void> => {
  await api.patch('/notifications/mark-all-as-read');
};

export const markAsReadNotification = async (uuid: string): Promise<void> => {
  await api.patch(`/notifications/${uuid}/mark-as-read`);
};

export const getNotification = async (uuid: string): Promise<Notification> => {
  const response: AxiosResponse<Notification> = await api.get(`/notifications/${uuid}`);
  return response.data;
};

export const saveNotification = async (notification: NotificationPayload, uuid?: string) => {
  const response: AxiosResponse<{ uuid: string }> = uuid 
    ? await api.put(`/notifications/${uuid}`, notification)
    : await api.post('/notifications', notification);
  return response.data;
};
