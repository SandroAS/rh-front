import { getAllEvaluations, getEvaluation, getEvaluations, saveEvaluation } from '@/services/evaluation.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type DRD from '@/types/drd/drd.type';
import type EvaluationPayload from '@/types/evaluation/evaluation-payload.type';
import type EvaluationResponsePagination from '@/types/evaluation/evaluation-response-pagination.type';
import type EvaluationSimple from '@/types/evaluation/evaluation-simple.type';
import type Evaluation from '@/types/evaluation/evaluation.type';
import { defineStore } from 'pinia';

interface EvaluationStoreState {
  evaluations: Evaluation[] | null;
  evaluations_simple: EvaluationSimple[] | null;
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
    evaluations_simple: null,
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

  getters: {
    evaluationOptions(): { value: string, title: string, subtitle: string }[] | [] {
      if(!this.evaluations_simple) return [];
      const evaluationsMapped = this.evaluations_simple.map(evaluation => {
        return {
          value: evaluation.uuid,
          title: evaluation.name || '',
          subtitle: 'DRD: '+evaluation?.drd?.jobPosition.title || '',
        }
      });
      return evaluationsMapped;
    }
  },

  actions: {
    async saveEvaluation(evaluation: EvaluationPayload, uuid?: string, drd?: DRD) {
      this.loading = true;
      this.error = null;

      try {
        const res: Evaluation = await saveEvaluation(evaluation, uuid);
        if(!this.evaluations) this.evaluations = [];
        const evaluationSaved = {
          uuid: res.uuid,
          name: res.name,
          description: res.description,
          rate: res.rate,
          drd_uuid: evaluation.drd_uuid,
          form: res.form,
          drd,
          created_by_user_uuid: evaluation.created_by_user_uuid,
          createdBy: res.createdBy
        }
        if(uuid) {
          const index = this.evaluations.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.evaluations.splice(index, 1, evaluationSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.evaluations.unshift(evaluationSaved);
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

    async getEvaluation(uuid: string) {
      this.loading = true;
      this.error = null;

      try {
        return await getEvaluation(uuid);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar Avaliação.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getAllEvaluations() {
      this.loading = true;
      this.error = null;

      try {
        this.evaluations_simple = await getAllEvaluations();
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar Avaliações.';
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
