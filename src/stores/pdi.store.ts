import { defineStore } from 'pinia';
import { getPdi, getPdis, getPdisByUserUuid, savePdi } from '@/services/pdi.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type Pdi from '@/types/pdi/pdi.type';
import type PdiPayload from '@/types/pdi/pdi-payload.type';
import type PdiResponsePagination from '@/types/pdi/pdi-response-pagination.type';

interface PdiStoreState {
  pdis: Pdi[] | null;
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

export const usePdiStore = defineStore('pdi', {
  state: (): PdiStoreState => ({
    pdis: null,
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
    async getPdis(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;
      try {
        const res: PdiResponsePagination = await getPdis(
          params.page,
          params.limit,
          params.sort_column,
          params.sort_order,
          params.search_term
        );
        this.pdis = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao buscar PDIs.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getPdi(uuid: string) {
      this.loading = true;
      this.error = null;
      try {
        return await getPdi(uuid);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao buscar PDI.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getPdisByUserUuid(userUuid: string): Promise<Pdi[]> {
      try {
        return await getPdisByUserUuid(userUuid);
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao buscar PDIs do usuário.';
        throw err;
      }
    },

    async savePdi(payload: PdiPayload, uuid?: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await savePdi(payload, uuid);
        if (!this.pdis) this.pdis = [];
        if (uuid) {
          const index = this.pdis.findIndex((x) => x.uuid === uuid);
          if (index !== -1) this.pdis.splice(index, 1, res);
        } else {
          this.pdis.unshift(res);
          this.total += 1;
        }
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao salvar PDI.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getPdis({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getPdis({ page: this.page, limit: this.limit, sort_column: this.sort_column, sort_order: this.sort_order, search_term: this.search_term });
    },
  },
});
