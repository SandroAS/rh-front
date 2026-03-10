import { defineStore } from 'pinia';
import { getPdiCategories, savePdiCategory } from '@/services/pdi-category.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type PdiCategory from '@/types/pdi/pdi-category.type';
import type PdiCategoryPayload from '@/types/pdi/pdi-category-payload.type';
import type PdiCategoryResponsePagination from '@/types/pdi/pdi-category-response-pagination.type';

interface PdiCategoryStoreState {
  pdi_categories: PdiCategory[] | null;
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

export const usePdiCategoryStore = defineStore('pdiCategory', {
  state: (): PdiCategoryStoreState => ({
    pdi_categories: null,
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
    pdiCategoryOptions(): { value: string; title: string }[] {
      if (!this.pdi_categories) return [];
      return this.pdi_categories.map((c) => ({ value: c.uuid, title: c.name }));
    },
  },

  actions: {
    async getPdiCategories(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;
      try {
        const res: PdiCategoryResponsePagination = await getPdiCategories(
          params.page,
          params.limit,
          params.sort_column,
          params.sort_order,
          params.search_term
        );
        this.pdi_categories = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar categorias de PDI.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async savePdiCategory(payload: PdiCategoryPayload, uuid?: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await savePdiCategory(payload, uuid);
        if (!this.pdi_categories) this.pdi_categories = [];
        if (uuid) {
          const index = this.pdi_categories.findIndex((x) => x.uuid === uuid);
          if (index !== -1) this.pdi_categories.splice(index, 1, res);
        } else {
          this.pdi_categories.unshift(res);
          this.total += 1;
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar salvar categoria de PDI.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getPdiCategories({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getPdiCategories({ page: this.page, limit: this.limit });
    },
  },
});
