import { getJobPositions, saveJobPosition } from '@/services/job-position.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import { defineStore } from 'pinia';
import type JobPosition from '@/types/jobPosition/job-position.type';
import type JobPositionPayload from '@/types/jobPosition/job-position-payload.type';
import type JobPositionResponsePagination from '@/types/jobPosition/job-position-response-pagination.type';

interface JobPositionStoreState {
  job_positions: JobPosition[] | null;
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

export const useJobPositionStore = defineStore('jobPosition', {
  state: (): JobPositionStoreState => ({
    job_positions: null,
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
    jobPositionsOptions(): { value: JobPosition, title: string, disabled: boolean }[] | [] {
      if(!this.job_positions) return [];
      const jobPositionsMapped = this.job_positions.map(job_position => {
        return {
          value: job_position,
          title: job_position.title,
          disabled: !!job_position.drd_uuid
        }
      });
      return jobPositionsMapped;
    }
  },

  actions: {
    async saveJobPosition(jobPosition: JobPositionPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveJobPosition(jobPosition, uuid);
        if(!this.job_positions) this.job_positions = [];
        const jobPositionSaved = {
          uuid: res.uuid,
          title: jobPosition.title,
          description: jobPosition.description,
          cbo_code: jobPosition.cbo_code,
          base_salary: jobPosition.base_salary,
          levelsGroup: jobPosition.levelsGroup
            ? { uuid: jobPosition.levelsGroup.uuid, name: jobPosition.levelsGroup.name, levels: jobPosition.levelsGroup.levels }
            : { uuid: '', name: '', levels: [] },
          drd_uuid: ''
        }
        if(uuid) {
          const index = this.job_positions.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.job_positions.splice(index, 1, jobPositionSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.job_positions.unshift(jobPositionSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getJobPositions(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: JobPositionResponsePagination = await getJobPositions(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.job_positions = res.data;
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
      await this.getJobPositions({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getJobPositions({ page: this.page, limit: this.limit });
    }
  }
});
