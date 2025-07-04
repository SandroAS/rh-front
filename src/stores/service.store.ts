import { getServices, saveService } from '@/services/services.service';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';
import type ServicePayload from '@/types/service/service-payload.type';
import type ServiceResponsePagination from '@/types/service/service-response-pagination.type';
import type Service from '@/types/service/service.type';
import { defineStore } from 'pinia';

interface ServiceStoreState {
  services: Service[] | null;
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

export const useServiceStore = defineStore('service', {
  state: (): ServiceStoreState => ({
    services: null,
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
    async saveService(service: ServicePayload, uuid?: string) {
      this.loading = true;
      this.error = null;

      try {
        const res: { uuid: string } = await saveService(service, uuid);
        if(!this.services) this.services = [];
        const serviceSaved = {
          uuid: res.uuid,
          name: service.name,
          description: service.description,
          price: service.price ?? '0.00',
          systemModule: service.systemModule
            ? { uuid: service.systemModule.uuid, name: service.systemModule.name }
            : { uuid: '', name: '' }
        }
        if(uuid) {
          const index = this.services.findIndex(x => x.uuid === uuid);
          if (index !== -1) {
            this.services.splice(index, 1, serviceSaved);
          } else {
            console.error('UUID: '+uuid+' não encontrado para atualizar localmente.')
          }
        } else {
          this.services.unshift(serviceSaved);
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getServices(params: DataTableFilterParams) {
      this.loading = true;
      this.error = null;

      try {
        const res: ServiceResponsePagination = await getServices(params.page, params.limit, params.sort_column, params.sort_order, params.search_term);
        this.services = res.data;
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
      await this.getServices({ page: this.page, limit: this.limit });
    },

    async setItemsPerPage(limit: number) {
      this.limit = limit;
      this.page = 1;
      await this.getServices({ page: this.page, limit: this.limit });
    }
  }
});
