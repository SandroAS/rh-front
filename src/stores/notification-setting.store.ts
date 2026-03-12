import { defineStore } from 'pinia';
import {
  getNotificationSettings,
  createNotificationSetting,
  updateNotificationSetting,
} from '@/services/notification-setting.service';
import { NotificationChannelType } from '@/types/notificationSetting/notification-channel-type';
import { NotificationSettingContext } from '@/types/notificationSetting/notification-setting-context';
import type NotificationSetting from '@/types/notificationSetting/notification-setting.type';
import type { CreateNotificationSettingPayload } from '@/types/notificationSetting/notification-setting-payload.type';
import { useUserStore } from '@/stores/auth.store';

interface NotificationSettingStoreState {
  settings: NotificationSetting[] | null;
  loading: boolean;
  error: string | null;
}

export const useNotificationSettingStore = defineStore('notificationSetting', {
  state: (): NotificationSettingStoreState => ({
    settings: null,
    loading: false,
    error: null,
  }),

  getters: {
    /** Configuração SYSTEM para EVALUATION_APPLICATION (default true se não existir). */
    evaluationApplicationSystem(state): boolean {
      const item = state.settings?.find(
        (s) =>
          s.context === NotificationSettingContext.EVALUATION_APPLICATION &&
          s.type === NotificationChannelType.SYSTEM
      );
      return item?.is_active ?? true;
    },
    /** Configuração EMAIL para EVALUATION_APPLICATION (default true se não existir). */
    evaluationApplicationEmail(state): boolean {
      const item = state.settings?.find(
        (s) =>
          s.context === NotificationSettingContext.EVALUATION_APPLICATION &&
          s.type === NotificationChannelType.EMAIL
      );
      return item?.is_active ?? true;
    },
  },

  actions: {
    async fetchNotificationSettings() {
      this.loading = true;
      this.error = null;
      try {
        this.settings = await getNotificationSettings();
      } catch (err: unknown) {
        this.error =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Erro ao carregar configurações de notificação.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Salva as preferências de notificação para aplicação de avaliações (SYSTEM e EMAIL).
     * Cria ou atualiza conforme já existir configuração.
     */
    async saveEvaluationApplicationSettings(system: boolean, email: boolean) {
      const userStore = useUserStore();
      const userUuid = userStore.user?.uuid;
      if (!userUuid) {
        this.error = 'Usuário não identificado.';
        throw new Error(this.error);
      }

      this.loading = true;
      this.error = null;
      try {
        const list = this.settings ?? (await getNotificationSettings());
        const context = NotificationSettingContext.EVALUATION_APPLICATION;

        const systemSetting = list.find(
          (s) => s.context === context && s.type === NotificationChannelType.SYSTEM
        );
        const emailSetting = list.find(
          (s) => s.context === context && s.type === NotificationChannelType.EMAIL
        );

        if (systemSetting) {
          await updateNotificationSetting(systemSetting.uuid, { is_active: system });
        } else {
          const payload: CreateNotificationSettingPayload = {
            user_uuid: userUuid,
            type: NotificationChannelType.SYSTEM,
            is_active: system,
            context,
          };
          await createNotificationSetting(payload);
        }

        if (emailSetting) {
          await updateNotificationSetting(emailSetting.uuid, { is_active: email });
        } else {
          const payload: CreateNotificationSettingPayload = {
            user_uuid: userUuid,
            type: NotificationChannelType.EMAIL,
            is_active: email,
            context,
          };
          await createNotificationSetting(payload);
        }

        await this.fetchNotificationSettings();
      } catch (err: unknown) {
        this.error =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Erro ao salvar configurações de notificação.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
