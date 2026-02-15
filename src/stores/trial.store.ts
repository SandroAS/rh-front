import { defineStore } from 'pinia';
import { getMyTrial } from '@/services/trial.service';
import type { TrialResponse } from '@/types/account/trial-response.type';

interface TrialStoreState {
  myTrial: TrialResponse | null;
  loading: boolean;
  error: string | null;
}

export const useTrialStore = defineStore('trial', {
  state: (): TrialStoreState => ({
    myTrial: null,
    loading: false,
    error: null,
  }),

  getters: {
    isTrialActive: (state): boolean => {
      if (!state.myTrial?.ended_at) return false;
      const endDate = new Date(state.myTrial.ended_at);
      const now = new Date();
      return endDate.getTime() >= now.getTime();
    },
    hasTrialExpired: (state): boolean => {
      if (!state.myTrial?.ended_at) return false;
      const endDate = new Date(state.myTrial.ended_at);
      const now = new Date();
      return endDate.getTime() < now.getTime();
    },
  },

  actions: {
    async fetchMyTrial(): Promise<TrialResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const data = await getMyTrial();
        this.myTrial = data;
        return data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Falha ao carregar dados do trial.';
        console.error('Erro na ação fetchMyTrial:', err);
        this.myTrial = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
