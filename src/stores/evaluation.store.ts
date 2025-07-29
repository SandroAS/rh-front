import { getEvaluations, saveEvaluation } from '@/services/evaluation.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type EvaluationPayload from '@/types/evaluation/evaluation-payload.type';
import type EvaluationResponsePagination from '@/types/evaluation/evaluation-response-pagination.type';
import type Evaluation from '@/types/evaluation/evaluation.type';

import { defineStore } from 'pinia';


interface EvaluationStoreState {
  evaluations: Evaluation[] | null;
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

export const useEvaluationStore = defineStore('evaluation', {
  state: (): EvaluationStoreState => ({
    evaluations: null,
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
    async saveEvaluation(evaluation: EvaluationPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveEvaluation(evaluation, uuid);
        if(!this.evaluations) this.evaluations = [];
        const Evaluationsaved = {
          uuid: res.uuid,
          rate: evaluation.rate,
          evaluationTopics: evaluation.evaluationTopics,
          createdByUser: evaluation.createdByUser
        }
        if(uuid) {
          const index = this.evaluations.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.evaluations.splice(index, 1, Evaluationsaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.evaluations.unshift(Evaluationsaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getEvaluations(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: EvaluationResponsePagination = await getEvaluations(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.evaluations = res.data;
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
      await this.getEvaluations({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getEvaluations({ page: this.page, limit: this.limit });
    }
  }
});
