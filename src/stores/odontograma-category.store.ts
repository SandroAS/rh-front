import { getOdontogramaCategories, saveOdontogramaCategory } from '@/services/odontograma-category.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type OdontogramaCategoryPayload from '@/types/odontogramaCategory/odontograma-category-payload.type';
import type OdontogramaCategoryResponsePagination from '@/types/odontogramaCategory/odontograma-category-response-pagination.type';
import type OdontogramaCategory from '@/types/odontogramaCategory/odontograma-category.type';
import { defineStore } from 'pinia';

interface OdontogramaCategoryStoreState {
  odontograma_categories: OdontogramaCategory[] | null;
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

export enum OdontogramaCategoryType { TOOTH = 'TOOTH', FACE = 'FACE' }

export const useOdontogramaCategoryStore = defineStore('odontogramaCategory', {
  state: (): OdontogramaCategoryStoreState => ({
    odontograma_categories: null,
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
    async saveOdontogramaCategory(odontogramaCategory: OdontogramaCategoryPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveOdontogramaCategory(odontogramaCategory, uuid);
        if(!this.odontograma_categories) this.odontograma_categories = [];
        const odontogramaCategorySaved = {
          uuid: res.uuid,
          name: odontogramaCategory.name,
          color: odontogramaCategory.color,
          type: odontogramaCategory.type!
        }
        if(uuid) {
          const index = this.odontograma_categories.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.odontograma_categories.splice(index, 1, odontogramaCategorySaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.odontograma_categories.unshift(odontogramaCategorySaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar categoria de odontograma.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getOdontogramaCategories(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: OdontogramaCategoryResponsePagination = await getOdontogramaCategories(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.odontograma_categories = res.data;
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
      await this.getOdontogramaCategories({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getOdontogramaCategories({ page: this.page, limit: this.limit });
    }
  }
});
