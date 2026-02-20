import {
  getCareerPlansPagination,
  saveCareerPlan,
  removeCareerPlan,
  getCareerPlanByUuid,
  getAllCareerPlans,
} from '@/services/career-plan.service';
import { defineStore } from 'pinia';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type CareerPlan from '@/types/careerPlan/career-plan.type';
import type CareerPlanResponsePagination from '@/types/careerPlan/career-plan-response-pagination.type';
import type CareerPlanPayload from '@/types/careerPlan/career-plan-payload.type';

interface CareerPlanStoreState {
  careerPlans: CareerPlan[] | null;
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

export const useCareerPlanStore = defineStore('careerPlan', {
  state: (): CareerPlanStoreState => ({
    careerPlans: null,
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

  getters: {
    careerPlansOptions(): { value: string, title: string, disabled: boolean }[] | [] {
      if(!this.careerPlans) return [];
      const careerPlansMapped = this.careerPlans.map(careerPlan => {
        return {
          value: careerPlan.uuid,
          title: careerPlan.name,
          disabled: false
        }
      });
      return careerPlansMapped;
    }
  },

  actions: {
    async getCareerPlans(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: CareerPlanResponsePagination = await getCareerPlansPagination(
          params.page,
          params.limit,
          params.sort_column,
          params.sort_order,
          params.search_term
        );
        this.careerPlans = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message ?? 'Erro ao buscar planos de carreira.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getAllCareerPlans() {
      this.loading = true;
      this.error = null;
      try {
        const res = await getAllCareerPlans();
        this.careerPlans = res;
      } catch (err: any) {
        this.error = err.response?.data?.message ?? 'Erro ao buscar todos os planos de carreira.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchCareerPlanByUuid(uuid: string): Promise<CareerPlan> {
      this.loading = true;
      this.error = null;
      try {
        const plan = await getCareerPlanByUuid(uuid);
        return plan;
      } catch (err: any) {
        this.error = err.response?.data?.message ?? 'Erro ao buscar plano de carreira.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async saveCareerPlan(careerPlan: CareerPlanPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res = await saveCareerPlan(careerPlan, uuid);
        if (!this.careerPlans) this.careerPlans = [];
        const positions = (careerPlan.careerPlanJobPositions ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const careerPlanSaved: CareerPlan = {
          uuid: res.uuid,
          name: careerPlan.name,
          careerPlanJobPositions: positions,
        };
        if (uuid) {
          const index = this.careerPlans.findIndex((x) => x.uuid === uuid);
          if (index !== -1) {
            this.careerPlans.splice(index, 1, careerPlanSaved);
          } else {
            this.careerPlans.unshift(careerPlanSaved);
          }
        } else {
          this.careerPlans.unshift(careerPlanSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message ?? 'Erro ao salvar plano de carreira.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async removeCareerPlan(uuid: string) {
      this.loading = true;
      this.error = null;

      try {
        await removeCareerPlan(uuid);
        if (this.careerPlans) {
          this.careerPlans = this.careerPlans.filter((x) => x.uuid !== uuid);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message ?? 'Erro ao remover plano de carreira.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getCareerPlans({
        page: this.page,
        limit: this.limit,
        sort_column: this.sort_column,
        sort_order: this.sort_order,
        search_term: this.search_term,
      });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getCareerPlans({
        page: this.page,
        limit: this.limit,
        sort_column: this.sort_column,
        sort_order: this.sort_order,
        search_term: this.search_term,
      });
    },
  },
});
