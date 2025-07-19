import { getTeams, saveTeam } from '../services/teams.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import { defineStore } from 'pinia';
import type Team from '@/types/team/team.type';
import type TeamPayload from '@/types/team/team-payload.type';
import type TeamResponsePagination from '@/types/team/team-response-pagination.type';
import type AccountUser from '@/types/account/account-user.type';
import { RoleType } from '@/types/user/user-role.type';

const MOCKED_ACCOUNT_USERS_FOR_TEAMS: AccountUser[] = [
  { uuid: 'user-1-uuid', name: 'Alice Smith', email: 'alice@example.com', is_active: true, role: { uuid: 'role-member', name: RoleType.MEMBER, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-2-uuid', name: 'Bob Johnson', email: 'bob@example.com', is_active: true, role: { uuid: 'role-member', name: RoleType.MEMBER, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-3-uuid', name: 'Charlie Brown', email: 'charlie@example.com', is_active: true, role: { uuid: 'role-leader', name: RoleType.LEADER, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-4-uuid', name: 'Diana Prince', email: 'diana@example.com', is_active: true, role: { uuid: 'role-admin', name: RoleType.ADMIN, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-5-uuid', name: 'Eve Adams', email: 'eve@example.com', is_active: true, role: { uuid: 'role-member', name: RoleType.MEMBER, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-6-uuid', name: 'Frank White', email: 'frank@example.com', is_active: true, role: { uuid: 'role-member', name: RoleType.MEMBER, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-7-uuid', name: 'Grace Lee', email: 'grace@example.com', is_active: true, role: { uuid: 'role-member', name: RoleType.MEMBER, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-8-uuid', name: 'Henry Ford', email: 'henry@example.com', is_active: true, role: { uuid: 'role-member', name: RoleType.MEMBER, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-9-uuid', name: 'Ivy Green', email: 'ivy@example.com', is_active: true, role: { uuid: 'role-member', name: RoleType.MEMBER, created_at: '2023-01-01', permissions: [] } },
  { uuid: 'user-10-uuid', name: 'Jack Black', email: 'jack@example.com', is_active: true, role: { uuid: 'role-member', name: RoleType.MEMBER, created_at: '2023-01-01', permissions: [] } },
];


let MOCKED_TEAMS: Team[] = [
  {
    uuid: 'team-a-uuid',
    name: 'Engenharia Backend',
    users: [
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[0], // Alice Smith
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[1], // Bob Johnson
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[2], // Charlie Brown
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[3], // Charlie Brown
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[4], // Charlie Brown
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[5], // Charlie Brown
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[6], // Charlie Brown
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[7], // Charlie Brown
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[8], // Charlie Brown
    ].filter(Boolean) as AccountUser[]
  },
  {
    uuid: 'team-b-uuid',
    name: 'Design UX/UI',
    users: [
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[3], // Diana Prince
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[4], // Eve Adams
    ].filter(Boolean) as AccountUser[]
  },
  {
    uuid: 'team-c-uuid',
    name: 'Marketing Digital',
    users: [
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[5], // Frank White
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[6], // Grace Lee
    ].filter(Boolean) as AccountUser[]
  },
  {
    uuid: 'team-d-uuid',
    name: 'Vendas Corporativas',
    users: [
      MOCKED_ACCOUNT_USERS_FOR_TEAMS[7], // Henry Ford
    ].filter(Boolean) as AccountUser[]
  },
];

interface TeamStoreState {
  teams: Team[] | null;
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
    async saveTeam(team: TeamPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveTeam(team, uuid);
        if(!this.teams) this.teams = [];
        const teamSaved = {
          uuid: res.uuid,
          name: team.name,
          users: team.users || []
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

    // async getTeams(params: DataTableFilterParams) {
    //   this.loading = true;
    //   this.error = null;

    //   try {
    //     const res: TeamResponsePagination = await getTeams(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
    //     this.teams = res.data;
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

    async getTeams(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        // Simular um atraso de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        // Filtrar por termo de busca
        let filteredTeams = MOCKED_TEAMS;
        if (params.search_term) {
          const lowerCaseSearchTerm = params.search_term.toLowerCase();
          filteredTeams = MOCKED_TEAMS.filter(team =>
            team.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            team.users.some(user => user.name.toLowerCase().includes(lowerCaseSearchTerm))
          );
        }

        // Simular ordenação
        if (params.sort_column && filteredTeams.length > 0) {
          filteredTeams.sort((a, b) => {
            let valA: any, valB: any;

            if (params.sort_column === 'name') {
              valA = a.name.toLowerCase();
              valB = b.name.toLowerCase();
            } else if (params.sort_column === 'users') {
              // Ordena pelo número de usuários ou pelo nome do primeiro usuário
              valA = a.users.length; // Ou a.users[0]?.name.toLowerCase()
              valB = b.users.length; // Ou b.users[0]?.name.toLowerCase()
            } else {
              // Caso padrão ou para outros campos
              valA = (a as any)[params.sort_column];
              valB = (b as any)[params.sort_column];
            }

            if (valA < valB) return params.sort_order === 'asc' ? -1 : 1;
            if (valA > valB) return params.sort_order === 'asc' ? 1 : -1;
            return 0;
          });
        }

        // Simular paginação
        const totalTeams = filteredTeams.length;
        const start = (params.page - 1) * params.limit;
        const end = start + params.limit;
        const paginatedTeams = filteredTeams.slice(start, end);

        this.teams = paginatedTeams;
        this.total = totalTeams;
        this.page = params.page;
        this.limit = params.limit;
        this.last_page = Math.ceil(totalTeams / params.limit);
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;

      } catch (err: any) {
        this.error = 'Erro ao tentar buscar times mockados.';
        console.error(err);
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
    }
  }
});
