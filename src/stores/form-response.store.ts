import { defineStore } from 'pinia';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type FormResponse from '@/types/formResponse/form-response.type';
import type FormResponsePayload from '@/types/formResponse/form-response-payload.type';
import type FormResponseResponsePagination from '@/types/formResponse/form-response-response-pagination.type';
import { getFormResponsesPagination, saveFormResponse, submitFormAnswers } from '@/services/form-response.service';


interface FormResponseStoreState {
  form_responses: FormResponse[] | null;
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

export const useFormResponseStore = defineStore('formResponse', {
  state: (): FormResponseStoreState => ({
    form_responses: null,
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
    async saveFormResponse(formResponse: FormResponsePayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {        
        const res: { uuid: string } = await saveFormResponse(formResponse, uuid);
        if(!this.form_responses) this.form_responses = [];
        const formResponseSaved = {
          uuid: res.uuid,
          is_completed: formResponse.is_completed,
          answers: formResponse.answers,
        }
        if(uuid) {
          const index = this.form_responses.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.form_responses.splice(index, 1, formResponseSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.form_responses.unshift(formResponseSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar salvar respostas de aplicação de avaliação.';
        console.error('Erro ao salvar respostas de aplicação de avaliação:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getFormResponses(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: FormResponseResponsePagination = await getFormResponsesPagination(
          params.page,
          params.limit,
          params.sort_column,
          params.sort_order,
          params.search_term
        );
        this.form_responses = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar respostas de aplicações de avaliação.';
        console.error('Erro ao buscar respostas de aplicações de avaliação:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async submitAnswers(evaluationApplicationUuid: string, payload: FormResponsePayload) {
      this.loading = true;
      this.error = null;

      try {
        await submitFormAnswers(evaluationApplicationUuid, payload);
        
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar enviar as respostas da avaliação.';
        console.error('Erro ao enviar respostas:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getFormResponses({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getFormResponses({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    }
  }
});
