import type { NotificationChannelType } from './notification-channel-type';
import type { NotificationSettingContext } from './notification-setting-context';

export default interface NotificationSetting {
  uuid: string;
  user_uuid: string;
  type: NotificationChannelType;
  is_active: boolean;
  context: NotificationSettingContext;
  created_at?: string;
  updated_at?: string;
}
