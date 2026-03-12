import { defineStore } from 'pinia';
import { getPlans, getPlanByUuid } from '@/services/plan.service';
import type { PlanResponse } from '@/types/plan/plan-response.type';

interface PlanStoreState {
  plans: PlanResponse[];
  currentPlan: PlanResponse | null;
  loading: boolean;
  error: string | null;
}

export const usePlanStore = defineStore('plan', {
  state: (): PlanStoreState => ({
    plans: [],
    currentPlan: null,
    loading: false,
    error: null,
  }),

  getters: {
    plansList: (state): PlanResponse[] => state.plans,
  },

  actions: {
    async fetchPlans(): Promise<PlanResponse[]> {
      this.loading = true;
      this.error = null;
      try {
        const data = await getPlans();
        this.plans = data;
        return data;
      } catch (err: unknown) {
        this.error =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Falha ao carregar planos.';
        console.error('Erro na ação fetchPlans:', err);
        this.plans = [];
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchPlanByUuid(uuid: string): Promise<PlanResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const data = await getPlanByUuid(uuid);
        this.currentPlan = data;
        return data;
      } catch (err: unknown) {
        this.error =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Falha ao carregar plano.';
        console.error('Erro na ação fetchPlanByUuid:', err);
        this.currentPlan = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
