import { defineStore } from 'pinia';
import { getEvaluationApplications, saveEvaluationApplication, deleteEvaluationApplication } from '@/services/evaluation-application.service'; // Importar os serviços
import type EvaluationApplication from '@/types/evaluationApplication/evaluation-application.type';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type EvaluationApplicationResponsePagination from '@/types/evaluationApplication/evaluation-application-response-pagination.type';

export interface EvaluationApplicationSavePayload {
  evaluation_model_uuid: string;
  type: 'peer' | 'self' | 'leader';
  requested_by_user_uuid: string;
  evaluated_collaborator_uuid: string;
  evaluator_collaborator_uuid: string;
  application_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  score?: number; // Opcional ao salvar
}

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
    // Exemplo de getter, se precisar buscar uma aplicação por UUID
    getApplicationByUuid: (state) => (uuid: string) => {
      return state.evaluation_applications?.find(app => app.uuid === uuid);
    }
  },

  actions: {
    async saveEvaluationApplication(application: EvaluationApplicationSavePayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveEvaluationApplication(application, uuid);

        if (uuid) {
          // Se for uma atualização, atualiza a aplicação no array local
          const index = this.evaluation_applications?.findIndex(x => x.uuid === uuid);
          if (this.evaluation_applications && index !== -1 && index !== undefined) {
            // Se a API retornar a aplicação completa, use-a. Caso contrário, crie um objeto parcial.
            // Para manter o padrão, vamos recarregar a lista após salvar para garantir consistência.
            // Ou você pode fazer uma requisição GET para a aplicação recém-salva/atualizada
            // para ter os dados mais frescos e completos.
            // Por simplicidade aqui, vamos apenas recarregar a lista, como na sua `getEvaluations`.
            await this.getEvaluationApplications({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
          } else {
            console.error('UUID: ' + uuid + ' não encontrado para atualizar localmente ou array de aplicações vazio.');
          }
        } else {
          // Se for uma nova criação, recarrega a lista para que a nova aplicação apareça
          await this.getEvaluationApplications({ page: 1, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
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

    async deleteEvaluationApplication(uuid: string) {
      this.loading = true;
      this.error = null;

      try {
        await deleteEvaluationApplication(uuid);
        if (this.evaluation_applications) {
          this.evaluation_applications = this.evaluation_applications.filter(app => app.uuid !== uuid);
          this.total--;
          // Se a página atual não tiver mais itens e não for a primeira, volta para a página anterior
          if (this.evaluation_applications.length === 0 && this.page > 1) {
            this.page--;
            await this.getEvaluationApplications({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
          }
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar excluir aplicação de avaliação.';
        console.error('Erro ao excluir aplicação de avaliação:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

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
