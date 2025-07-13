import { getCareerPlans, saveCareerPlan } from '@/services/career-plan.service';
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
    search_term: undefined
  }),

  getters: {},

  actions: {
    async saveCareerPlan(careerPlan: CareerPlanPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveCareerPlan(careerPlan, uuid);
        if(!this.careerPlans) this.careerPlans = [];
        const careerPlanSaved = {
          uuid: res.uuid,
          name: careerPlan.name,
          jobPositionsInCareer: careerPlan.jobPositionsInCareer
        }
        if(uuid) {
          const index = this.careerPlans.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.careerPlans.splice(index, 1, careerPlanSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.careerPlans.unshift(careerPlanSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getCareerPlans(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: CareerPlanResponsePagination = await getCareerPlans(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.careerPlans = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar serviços.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getCareerPlans({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getCareerPlans({ page: this.page, limit: this.limit });
    }
  }
});
