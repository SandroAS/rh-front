import type { NotificationChannelType } from './notification-channel-type';
import type { NotificationSettingContext } from './notification-setting-context';

/** Payload para criar configuração de notificação. */
export interface CreateNotificationSettingPayload {
  user_uuid: string;
  type: NotificationChannelType;
  is_active?: boolean;
  context: NotificationSettingContext;
}

/** Payload para atualizar (PUT) – is_active opcional. */
export interface UpdateNotificationSettingPayload {
  is_active?: boolean;
}
