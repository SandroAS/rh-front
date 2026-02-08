import { getTeams, saveTeam, getTotalTeams } from '../services/teams.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type TeamsTotals from '@/types/dashboard/teams-totals.type';
import { defineStore } from 'pinia';
import type Team from '@/types/team/team.type';
import type TeamPayload from '@/types/team/team-payload.type';
import type TeamResponsePagination from '@/types/team/team-response-pagination.type';
import type { UserAvatar } from '@/types/user/user-avatar.type';
import type Sector from '@/types/sector/sector.type';

interface TeamStoreState {
  teams: Team[] | null;
  teams_totals: TeamsTotals | null;
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

export const useTeamStore = defineStore('team', {
  state: (): TeamStoreState => ({
    teams: null,
    teams_totals: null,
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
    teamsOptions(): { value: Team, title: string, disabled: boolean }[] | [] {
      if(!this.teams) return [];
      const teamsMapped = this.teams.map(team => {
        return {
          value: team,
          title: team.name,
          disabled: false
        }
      });
      return teamsMapped;
    }
  },

  actions: {
    async saveTeam(team: TeamPayload, leader: UserAvatar, sector?: Sector, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res = await saveTeam(team, uuid);
        if(!this.teams) this.teams = [];
        const teamSaved = {
          uuid: res.uuid,
          name: team.name,
          createdBy: team.createdBy,
          leader,
          sector,
          teamMembers: res.teamMembers
        }
        if(uuid) {
          const index = this.teams.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.teams.splice(index, 1, teamSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.teams.unshift(teamSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getTeams(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: TeamResponsePagination = await getTeams(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.teams = res.data;
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
      await this.getTeams({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getTeams({ page: this.page, limit: this.limit });
    },

    async getTeamsTotals() {
      this.loading = true;
      this.error = null;

      try {
        const res: TeamsTotals = await getTotalTeams();
        this.teams_totals = res;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar totais de times.';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
