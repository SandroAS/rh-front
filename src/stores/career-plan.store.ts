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

    // async getCareerPlans(params: DataTableFilterParams) {
    //   this.loading = true;
    //   this.error = null;

    //   try {
    //     const res: CareerPlanResponsePagination = await getCareerPlans(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
    //     this.careerPlans = res.data;
    //     this.total = res.total;
    //     this.page = res.page;
    //     this.limit = res.limit;
    //     this.last_page = res.last_page;
    //     this.sort_column = params.sort_column;
    //     this.sort_order = params.sort_order;
    //     this.search_term = params.search_term;
    //   } catch (err: any) {
    //     this.error = err.response?.data?.message || 'Erro ao tentar buscar serviços.';
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    async getCareerPlans(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        // --- INÍCIO DO MOCK DE DADOS ---
        await new Promise(resolve => setTimeout(resolve, 800)); // Simula o tempo de resposta da API

        const allMockedCareerPlans: CareerPlan[] = [
          {
            uuid: 'cp-uuid-1',
            name: 'Plano de Carreira Desenvolvedor',
            jobPositionsInCareer: [
              {
                uuid: 'jpic-uuid-1-1',
                jobPosition: { uuid: 'jp-1', name: 'Dev Jr' },
                nextJobPosition: { uuid: 'jp-2', name: 'Dev Pleno' },
                order: 1,
              },
              {
                uuid: 'jpic-uuid-1-2',
                jobPosition: { uuid: 'jp-2', name: 'Dev Pleno' },
                nextJobPosition: { uuid: 'jp-3', name: 'Dev Sênior' },
                order: 2,
              },
              {
                uuid: 'jpic-uuid-1-2',
                jobPosition: { uuid: 'jp-2', name: 'Dev Pleno' },
                nextJobPosition: { uuid: 'jp-3', name: 'Dev Sênior' },
                order: 3,
              },
              {
                uuid: 'jpic-uuid-1-2',
                jobPosition: { uuid: 'jp-2', name: 'Dev Pleno' },
                nextJobPosition: { uuid: 'jp-3', name: 'Dev Sênior' },
                order: 4,
              },
              {
                uuid: 'jpic-uuid-1-2',
                jobPosition: { uuid: 'jp-2', name: 'Dev Pleno' },
                nextJobPosition: { uuid: 'jp-3', name: 'Dev Sênior' },
                order: 5,
              },
              {
                uuid: 'jpic-uuid-1-2',
                jobPosition: { uuid: 'jp-2', name: 'Dev Pleno' },
                nextJobPosition: { uuid: 'jp-3', name: 'Dev Sênior' },
                order: 6,
              },
              {
                uuid: 'jpic-uuid-1-3',
                jobPosition: { uuid: 'jp-3', name: 'Dev Sênior' },
                nextJobPosition: undefined, // Último na cadeia
                order: 7,
              },
            ],
          },
          {
            uuid: 'cp-uuid-2',
            name: 'Plano de Carreira Analista de Dados',
            jobPositionsInCareer: [
              {
                uuid: 'jpic-uuid-2-1',
                jobPosition: { uuid: 'jp-4', name: 'Analista Jr' },
                nextJobPosition: { uuid: 'jp-5', name: 'Analista Pleno' },
                order: 1,
              },
              {
                uuid: 'jpic-uuid-2-2',
                jobPosition: { uuid: 'jp-5', name: 'Analista Pleno' },
                nextJobPosition: undefined,
                order: 2,
              },
            ],
          },
          {
            uuid: 'cp-uuid-3',
            name: 'Plano de Carreira Gerencial',
            jobPositionsInCareer: [
              {
                uuid: 'jpic-uuid-3-1',
                jobPosition: { uuid: 'jp-6', name: 'Coordenador' },
                nextJobPosition: { uuid: 'jp-7', name: 'Gerente' },
                order: 1,
              },
              {
                uuid: 'jpic-uuid-3-2',
                jobPosition: { uuid: 'jp-7', name: 'Gerente' },
                nextJobPosition: undefined,
                careerPlanY: { uuid: 'cp-uuid-4', name: 'Plano de Carreira Executiva' }, // Exemplo com careerPlanY
                order: 2,
              },
            ],
          },
          {
            uuid: 'cp-uuid-4',
            name: 'Plano de Carreira Executiva',
            jobPositionsInCareer: [
              {
                uuid: 'jpic-uuid-4-1',
                jobPosition: { uuid: 'jp-8', name: 'Diretor' },
                nextJobPosition: { uuid: 'jp-9', name: 'VP' },
                order: 1,
              },
              {
                uuid: 'jpic-uuid-4-2',
                jobPosition: { uuid: 'jp-9', name: 'VP' },
                nextJobPosition: undefined,
                order: 2,
              },
            ],
          },
          {
            uuid: 'cp-uuid-5',
            name: 'Plano de Carreira Especialista',
            jobPositionsInCareer: [
              {
                uuid: 'jpic-uuid-5-1',
                jobPosition: { uuid: 'jp-10', name: 'Especialista I' },
                nextJobPosition: { uuid: 'jp-11', name: 'Especialista II' },
                order: 1,
              },
              {
                uuid: 'jpic-uuid-5-2',
                jobPosition: { uuid: 'jp-11', name: 'Especialista II' },
                nextJobPosition: undefined,
                order: 2,
              },
            ],
          },
        ];

        // Aplica o filtro de busca (simples)
        const filteredPlans = params.search_term
          ? allMockedCareerPlans.filter(plan =>
              plan.name.toLowerCase().includes(params.search_term!.toLowerCase())
            )
          : allMockedCareerPlans;

        // Simula paginação
        const totalItems = filteredPlans.length;
        const page = params.page || this.page;
        const limit = params.limit || this.limit;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

        // Simula ordenação (apenas por 'name')
        if (params.sort_column === 'name' && paginatedPlans.length > 0) {
          paginatedPlans.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return params.sort_order === 'asc' ? -1 : 1;
            if (nameA > nameB) return params.sort_order === 'asc' ? 1 : -1;
            return 0;
          });
        }


        this.careerPlans = paginatedPlans;
        this.total = totalItems;
        this.page = page;
        this.limit = limit;
        this.last_page = Math.ceil(totalItems / limit) || 1;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
        // --- FIM DO MOCK DE DADOS ---
      } catch (err: any) {
        this.error = 'Erro simulado ao tentar buscar planos de carreira.';
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
