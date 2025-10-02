import { getSectors, saveSector } from '@/services/sector.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import { defineStore } from 'pinia';
import type Sector from '@/types/sector/sector.type';
import type SectorPayload from '@/types/sector/sector-payload.type';
import type SectorResponsePagination from '@/types/sector/sector-response-pagination.type';


interface SectorStoreState {
  sectors: Sector[] | null;
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

export const useSectorStore = defineStore('sector', {
  state: (): SectorStoreState => ({
    sectors: null,
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
    sectorsOptions(): { value: string, title: string, disabled: boolean }[] | [] {
      if(!this.sectors) return [];
      const sectorsMapped = this.sectors.map(sector => {
        return {
          value: sector.uuid,
          title: sector.name,
          disabled: false
        }
      });
      return sectorsMapped;
    }
  },

  actions: {
    async saveSector(sector: SectorPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveSector(sector, uuid);
        if(!this.sectors) this.sectors = [];
        const sectorSaved = {
          uuid: res.uuid,
          name: sector.name
        }
        if(uuid) {
          const index = this.sectors.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.sectors.splice(index, 1, sectorSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.sectors.unshift(sectorSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getSectors(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: SectorResponsePagination = await getSectors(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.sectors = res.data;
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
      await this.getSectors({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getSectors({ page: this.page, limit: this.limit });
    }
  }
});
