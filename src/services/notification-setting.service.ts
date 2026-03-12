import type { AxiosResponse } from 'axios';
import api from './api.service';
import type NotificationSetting from '@/types/notificationSetting/notification-setting.type';
import type { CreateNotificationSettingPayload } from '@/types/notificationSetting/notification-setting-payload.type';
import type { UpdateNotificationSettingPayload } from '@/types/notificationSetting/notification-setting-payload.type';

/** Lista todas as configurações de notificação do usuário logado. */
export const getNotificationSettings = async (): Promise<NotificationSetting[]> => {
  const response: AxiosResponse<NotificationSetting[]> = await api.get('/notification-settings');
  return response.data;
};

/** Cria uma configuração de notificação. */
export const createNotificationSetting = async (
  payload: CreateNotificationSettingPayload
): Promise<NotificationSetting> => {
  const response: AxiosResponse<NotificationSetting> = await api.post('/notification-settings', payload);
  return response.data;
};

/** Atualiza uma configuração de notificação. */
export const updateNotificationSetting = async (
  uuid: string,
  payload: UpdateNotificationSettingPayload
): Promise<NotificationSetting> => {
  const response: AxiosResponse<NotificationSetting> = await api.put(`/notification-settings/${uuid}`, payload);
  return response.data;
};
