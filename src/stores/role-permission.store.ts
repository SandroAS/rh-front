import type { Role } from '@/types/role/role.type';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import { defineStore } from 'pinia';
import type RoleResponsePaginationDto from '@/types/role/role-response-pagination.type';
import { getAllPermissions, getRolesPermissions } from '@/services/role-permission.service';
import { RoleType } from '@/types/user/user-role.type';

interface RoleStoreState {
  roles: Role[] | null;
  permissions: string[] | null;
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

export const useRoleStore = defineStore('role', {
  state: (): RoleStoreState => ({
    roles: null,
    permissions: null,
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
    formatName(name: string) {
      switch (name) {
        case RoleType.ADMIN: return 'Administrador'
        case RoleType.ASSISTANT: return 'Assistente'
        case RoleType.HEALTHCARE_PROFESSIONAL: return 'Profissional de Saúde'
        default: ''
      }
    },

    async getPermissions() {
      this.loading = true;
      this.error = null;

      try {
        const res: string[] = await getAllPermissions();
        this.permissions = res;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar usuário.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getRolesPermissions(params: DataTableFilterParams = { page: 1, limit: 10 }) {
      this.loading = true;
      this.error = null;

      try {
        const res: RoleResponsePaginationDto = await getRolesPermissions(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.roles = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar usuário.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getRolesPermissions({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getRolesPermissions({ page: this.page, limit: this.limit });
    }
  }
});
