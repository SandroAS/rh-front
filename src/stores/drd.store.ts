import { getAllDRDs, getDRD, getDRDs, saveDRD } from '@/services/drd.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type DRDPayload from '@/types/drd/drd-payload.type';
import type DRDResponsePagination from '@/types/drd/drd-response-pagination.type';
import type DRDSimple from '@/types/drd/drd-simple.type';
import { defineStore } from 'pinia';


interface DRDStoreState {
  drds: DRDSimple[] | null;
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

export const useDRDStore = defineStore('drd', {
  state: (): DRDStoreState => ({
    drds: null,
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
    drdOptions(): { value: string, title: string }[] | [] {
      if(!this.drds) return [];
      const drdsMapped = this.drds.map(drd => {
        return {
          value: drd.uuid,
          title: drd.jobPosition.title,
          // disabled: !!drd.evaluation_uuid - CRIAR DP O RELACIONAMENTO COM evaluation para deixar ter um só modelo por DRD.q
        }
      });
      return drdsMapped;
    }
  },

  actions: {
    async saveDRD(drd: DRDPayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res = await saveDRD(drd, uuid);
        if(!this.drds) this.drds = [];
        const DRDsaved = {
          uuid: res.uuid,
          rate: drd.rate,
          jobPosition: res.jobPosition,
          createdByUser: res.createdByUser
        }
        if(uuid) {
          const index = this.drds.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.drds.splice(index, 1, DRDsaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.drds.unshift(DRDsaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getDRDs(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: DRDResponsePagination = await getDRDs(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.drds = res.data;
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.last_page = res.last_page;
        this.sort_column = params.sort_column;
        this.sort_order = params.sort_order;
        this.search_term = params.search_term;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar DRDs.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getDRD(uuid: string) {
      this.loading = true;
      this.error = null;

      try {
        return await getDRD(uuid);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar DRD.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getAllDRDs() {
      this.loading = true;
      this.error = null;

      try {
        this.drds = await getAllDRDs();
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar buscar serviços.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.page = page;
      await this.getDRDs({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getDRDs({ page: this.page, limit: this.limit });
    }
  }
});
