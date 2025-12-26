import { defineStore } from 'pinia';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type Notification from '@/types/notification/notification.type';
import { getNotifications, saveNotification } from '@/services/notification.service';
import type NotificationResponsePagination from '@/types/notification/notification-response-pagination.type';
import type NotificationPayload from '@/types/notification/notification-payload.type';

interface NotificationStoreState {
  notifications: Notification[] | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  last_page: number;
  limit: number;
  sort_column?: string;
  sort_order?: 'asc' | 'desc';
  search_term?: string;
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationStoreState => ({
    notifications: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    last_page: 1,
    limit: 10,
    sort_column: undefined,
    sort_order: undefined,
    search_term: undefined,
  }),

  actions: {
    async saveNotification(notification: NotificationPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {        
        const res: { uuid: string } = await saveNotification(notification, uuid);
        if(!this.notifications) this.notifications = [];
        const notificationSaved = {
          uuid: res.uuid,
          user_uuid: notification.user_uuid,
          category: notification.category,
          template_key: notification.template_key,
          evaluation_application_uuid: notification.evaluation_application_uuid,
          evaluationApplication: notification.evaluationApplication,
          viewed_at: notification.viewed_at,
          is_hidden: notification.is_hidden,
          created_at: notification.created_at
        }
        if(uuid) {
          const index = this.notifications.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.notifications.splice(index, 1, notificationSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar notificação.')
          }
        } else {
          this.notifications.unshift(notificationSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar salvar notificação.';
        console.error('Erro ao salvar notificação:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getNotifications(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: NotificationResponsePagination = await getNotifications(
          params.page,
          params.limit,
          params.sort_column,
          params.sort_order,
          params.search_term
        );
        this.notifications = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar notificações.';
        console.error('Erro ao buscar notificações:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getNotifications({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getNotifications({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    }
  }
});
