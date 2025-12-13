import { defineStore } from 'pinia';
import { getEvaluationApplications, saveEvaluationApplication, deleteEvaluationApplication, getEvaluationApplication } from '@/services/evaluation-application.service'; // Importar os serviços
import { type EvaluationApplication }from '@/types/evaluationApplication/evaluation-application.type';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type EvaluationApplicationResponsePagination from '@/types/evaluationApplication/evaluation-application-response-pagination.type';
import { type CreateEvaluationApplication, type EvaluationApplicationPayload } from '@/types/evaluationApplication/evaluation-application-payload.type';

interface EvaluationApplicationStoreState {
  evaluation_applications: EvaluationApplication[] | null;
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

export const useEvaluationApplicationStore = defineStore('evaluationApplication', {
  state: (): EvaluationApplicationStoreState => ({
    evaluation_applications: null,
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
    getApplicationByUuid: (state) => (uuid: string) => {
      return state.evaluation_applications?.find(app => app.uuid === uuid);
    }
  },

  actions: {
    async saveEvaluationApplication(application: EvaluationApplicationPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { applications: CreateEvaluationApplication[] } = await saveEvaluationApplication(application, uuid);
        if(!this.evaluation_applications) this.evaluation_applications = [];
        if(uuid) {
          const evaluationSaved = {
            uuid: application.uuid!,
            evaluation_uuid: application.evaluation_uuid,
            evaluation: application.evaluation!,
            started_date: application.started_date!,
            expiration_date: application.expiration_date!,
            status: application.status,
            type: application.type!,
            evaluated_user_uuid: application.evaluated_user_uuid!,
            evaluated_user: application.evaluated_user!,
            submitting_user_uuid: application.submitting_user_uuid!,
            submitting_user: application.submitting_user!,
          }
          const index = this.evaluation_applications.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.evaluation_applications.splice(index, 1, evaluationSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          res.applications.forEach(createApplication => {
            this.evaluation_applications?.unshift({
              uuid: createApplication.uuid!,
              evaluation_uuid: application.evaluation_uuid,
              evaluation: application.evaluation!,
              started_date: application.started_date!,
              expiration_date: application.expiration_date!,
              status: application.status,
              type: createApplication.type!,
              evaluated_user_uuid: createApplication.evaluated_user_uuid!,
              evaluated_user: createApplication.evaluated_user!,
              submitting_user_uuid: createApplication.submitting_user_uuid!,
              submitting_user: createApplication.submitting_user!,
            });
          })
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar salvar aplicação de avaliação.';
        console.error('Erro ao salvar aplicação de avaliação:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // async getEvaluationApplications(params: DataTableFilterParams) {
    //   this.loading = true;
    //   this.error = null;

    //   try {
    //     const res: EvaluationApplicationResponsePagination = await getEvaluationApplications(
    //       params.page,
    //       params.limit,
    //       params.sort_column,
    //       params.sort_order,
    //       params.search_term
    //     );
    //     this.evaluation_applications = res.data;
    //     this.total = res.total;
    //     this.page = res.page;
    //     this.limit = res.limit;
    //     this.last_page = res.last_page;
    //     this.sort_column = params.sort_column;
    //     this.sort_order = params.sort_order;
    //     this.search_term = params.search_term;
    //   } catch (err: any) {
    //     this.error = err.response?.data?.message || 'Erro ao tentar buscar aplicações de avaliação.';
    //     console.error('Erro ao buscar aplicações de avaliação:', err);
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    async getEvaluationApplications(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
          // Lógica para dados mockados
          this.evaluation_applications = [];
          this.total = 1;
          this.page = params.page;
          this.limit = params.limit;
          this.last_page = 1;
          this.sort_column = params.sort_column;
          this.sort_order = params.sort_order;
          this.search_term = params.search_term;
        } else {
          // Lógica de API real
          const res: EvaluationApplicationResponsePagination = await getEvaluationApplications(
            params.page,
            params.limit,
            params.sort_column,
            params.sort_order,
            params.search_term
          );
          this.evaluation_applications = res.data;
          // ... (resto da lógica)
        }
      } catch (err: any) {
        // ... (erro)
      } finally {
        this.loading = false;
      }
    },

    async getEvaluationApplication(uuid: string) {
      this.loading = true;
      this.error = null;

      try {
        return await getEvaluationApplication(uuid);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar Aplicação de Avaliação.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // async deleteEvaluationApplication(uuid: string) {
    //   this.loading = true;
    //   this.error = null;

    //   try {
    //     await deleteEvaluationApplication(uuid);
    //     if (this.evaluation_applications) {
    //       this.evaluation_applications = this.evaluation_applications.filter(app => app.uuid !== uuid);
    //       this.total--;
    //       // Se a página atual não tiver mais itens e não for a primeira, volta para a página anterior
    //       if (this.evaluation_applications.length === 0 && this.page > 1) {
    //         this.page--;
    //         await this.getEvaluationApplications({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    //       }
    //     }
    //   } catch (err: any) {
    //     this.error = err.response?.data?.message || 'Erro ao tentar excluir aplicação de avaliação.';
    //     console.error('Erro ao excluir aplicação de avaliação:', err);
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    async setPage(page: number) {
      this.page = page;
      await this.getEvaluationApplications({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getEvaluationApplications({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    }
  }
});
