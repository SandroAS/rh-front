import { defineStore } from 'pinia';
import { getUserPanel } from '@/services/user.service';
import type { UserPanel } from '@/types/user/user-panel.type';

interface UserPanelStoreState {
  userPanel: UserPanel | null;
  loading: boolean;
  error: string | null;
}

export const useUserPanelStore = defineStore('userPanel', {
  state: (): UserPanelStoreState => ({
    userPanel: null,
    loading: false,
    error: null,
  }),

  actions: {
    async getUserPanel(uuid: string): Promise<UserPanel | null> {
      this.loading = true;
      this.error = null;
      try {
        const data = await getUserPanel(uuid);
        this.userPanel = data;
        return data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Falha ao carregar dados do painel do usuário.';
        console.error('Erro na ação getUserPanel:', err);
        this.userPanel = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
