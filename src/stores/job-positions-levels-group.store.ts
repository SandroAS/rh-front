import { getLevelsGroups, getLevelsGroupsPagination, saveLevelsGroup } from '@/services/job-positions-levels-group.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type JobPositionsLevelsGroupPayload from '@/types/jobPositionsLevelsGroup/job-positions-levels-group-payload.type';
import type JobPositionsLevelsGroupResponsePagination from '@/types/jobPositionsLevelsGroup/job-positions-levels-group-response-pagination.type';
import type JobPositionsLevelsGroup from '@/types/jobPositionsLevelsGroup/job-positions-levels-group.type';
import type { UserAvatar } from '@/types/user/user-avatar.type';
import { defineStore } from 'pinia';

interface JobPositionsLevelsGroupStoreState {
  levels_groups: JobPositionsLevelsGroup[] | null;
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

export const useJobPositionsLevelsGroupStore = defineStore('jobPositionsLevelsGroup', {
  state: (): JobPositionsLevelsGroupStoreState => ({
    levels_groups: null,
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
    levelsGroupsOptions(): { value: string, title: string, disabled?: boolean }[] | [] {
      if(!this.levels_groups) return [];
      const levelsGroupsMapped = this.levels_groups.map(level_group => {
        return {
          value: level_group.uuid,
          title: level_group.name,
        }
      });
      return levelsGroupsMapped;
    }
  },

  actions: {
    async getLevelsGroups() {
      this.loading = true;
      this.error = null;

      try {
       this.levels_groups = await getLevelsGroups();
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async saveLevelsGroup(levelsGroup: JobPositionsLevelsGroupPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveLevelsGroup(levelsGroup, uuid);
        if(!this.levels_groups) this.levels_groups = [];
        const levelsGroupSaved = {
          uuid: res.uuid,
          name: levelsGroup.name,
          createdBy: levelsGroup.createdBy,
          jobPositionsLevels: levelsGroup.jobPositionsLevels
            ? levelsGroup.jobPositionsLevels.map(jobPositionsLevel => ({ uuid: jobPositionsLevel.uuid, name: jobPositionsLevel.name, salary: jobPositionsLevel.salary }))
            : [{ uuid: '', name: '', salary: 0 }]
        }
        if(uuid) {
          const index = this.levels_groups.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.levels_groups.splice(index, 1, levelsGroupSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.levels_groups.unshift(levelsGroupSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getLevelsGroupsPagination(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: JobPositionsLevelsGroupResponsePagination = await getLevelsGroupsPagination(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.levels_groups = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar grupos de níveis de cargos.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getLevelsGroupsPagination({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getLevelsGroupsPagination({ page: this.page, limit: this.limit });
    }
  }
});
