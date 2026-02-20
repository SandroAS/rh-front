import { getAccountUsers, saveAccountUser, updateAccountUserIsActive, getTotalAccountUsers } from '@/services/account-user.service';
import type AccountUserPayload from '@/types/account/account-user-payload.type';
import type AccountUser from '@/types/account/account-user.type';
import type AccountUsersResponsePaginationDto from '@/types/account/account-users-response-pagination-dto';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type AccountUsersTotals from '@/types/dashboard/account-users-totals.type';
import { defineStore } from 'pinia';
import { getAllAccountUsers, getAllAccountUsersWithTeams } from '@/services/user.service';
import type { UserAvatar } from '@/types/user/user-avatar.type';
import type { UserTeam } from '@/types/user/user-team.type';
import type TeamResponse from '@/types/team/team-response.type';
import type CareerPlanSimple from '@/types/careerPlan/career-plan-simple.type';

interface AccountUserStoreState {
  account_users: AccountUser[] | null;
  all_account_users: UserAvatar[] | null;
  all_account_users_teams: UserTeam[] | null;
  account_users_totals: AccountUsersTotals | null;
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

export const useAccountUserStore = defineStore('accountUser', {
  state: (): AccountUserStoreState => ({
    account_users: null,
    all_account_users: null,
    all_account_users_teams: null,
    account_users_totals: null,
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
    accountUsersOptions(): { value: string, title: string, avatar?: UserAvatar['profile_img_url'], disabled?: boolean }[] | [] {
      if(!this.all_account_users) return [];
      const levelsGroupsMapped = this.all_account_users.map(account_user => {
        return {
          value: account_user.uuid,
          title: account_user.name,
          avatar: account_user.profile_img_url,
          disabled: false
        }
      });

      return levelsGroupsMapped;
    },
    accountUsersOptionsTeams(): { value: string, title: string, avatar?: UserAvatar['profile_img_url'], jobPosition?: UserTeam['jobPosition'], teams: TeamResponse[], disabled?: boolean }[] | [] {
      if(!this.all_account_users_teams) return [];
      const levelsGroupsMapped = this.all_account_users_teams.map(account_user_team => {
        return {
          value: account_user_team.uuid,
          title: account_user_team.name,
          avatar: account_user_team.profile_img_url,
          jobPosition: account_user_team.jobPosition,
          teams: account_user_team.teams,
          disabled: false
        }
      });

      return levelsGroupsMapped;
    },
  },

  actions: {
    async saveAccountUser(
      accountUser: AccountUserPayload,
      uuid?: string,
      options?: {
        careerPlan?: CareerPlanSimple;
        jobPosition?: { uuid: string; title: string };
        sectors?: { uuid: string; name: string }[];
      }
    ) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string, role: { uuid: string } } = await saveAccountUser(accountUser, uuid);
        if(!this.account_users) this.account_users = [];
        const careerPlan = options?.careerPlan ?? (accountUser.career_plan_uuid ? { uuid: accountUser.career_plan_uuid, name: '' } : undefined);
        const jobPosition = accountUser.job_position_uuid
          ? (options?.jobPosition
            ? { uuid: options.jobPosition.uuid, title: options.jobPosition.title, description: '', cbo_code: undefined, base_salary: undefined, levelsGroup: undefined, drd_uuid: undefined }
            : { uuid: accountUser.job_position_uuid, title: '', description: '', cbo_code: undefined, base_salary: undefined, levelsGroup: undefined, drd_uuid: undefined })
          : undefined;
        const sectorUuids = accountUser.sector_uuids?.length
          ? accountUser.sector_uuids
          : accountUser.sector_uuid
            ? [accountUser.sector_uuid]
            : [];
        const sectors = options?.sectors ?? sectorUuids.map(uuid => ({ uuid, name: '' }));
        const accountUserSaved = {
          uuid: res.uuid,
          name: accountUser.name,
          email: accountUser.email,
          cellphone: accountUser.cellphone,
          cpf: accountUser.cpf,
          is_active: true,
          password: 'passworldAlreadySet',
          role: {
            uuid: res.role.uuid,
            name: accountUser.role,
            created_at: '',
            permissions: []
          },
          jobPosition,
          sectors,
          career_plan_uuid: accountUser.career_plan_uuid,
          careerPlan,
        }
        if(uuid) {
          const accountUserFind = this.account_users.find(x => x.uuid === uuid);
          const index = this.account_users.indexOf(accountUserFind!);
          this.account_users.splice(index, 1, accountUserSaved!)
        } else {
          this.account_users.push(accountUserSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar usuário.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateAccountUserIsActive(uuid: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: boolean = await updateAccountUserIsActive(uuid);
        if(!res) this.error = 'Erro ao tentar ativar/inativar usuário.';
        const accountUserFind = this.account_users!.find(x => x.uuid === uuid);
        const index = this.account_users!.indexOf(accountUserFind!);
        this.account_users!.splice(index, 1, {...accountUserFind!, is_active: !accountUserFind!.is_active})
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar ativar/inativar usuário.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getAccountUsers(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: AccountUsersResponsePaginationDto = await getAccountUsers(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.account_users = res.users;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar usuários.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getAllAccountUsers() {
      this.loading = true;
      this.error = null;

      try {
        const res: UserAvatar[] = await getAllAccountUsers();
        this.all_account_users = res;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar todos os usuários.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getAllAccountUsersWithTeams() {
      this.loading = true;
      this.error = null;

      try {
        const res: UserTeam[] = await getAllAccountUsersWithTeams();
        this.all_account_users_teams = res;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar todos os usuários.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getAccountUsers({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getAccountUsers({ page: this.page, limit: this.limit });
    },

    async getAccountUsersTotals() {
      this.loading = true;
      this.error = null;

      try {
        const res: AccountUsersTotals = await getTotalAccountUsers();
        this.account_users_totals = res;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar totais de colaboradores.';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
