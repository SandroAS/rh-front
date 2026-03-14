import { defineStore } from 'pinia';
import { createSale as createSaleService } from '@/services/sales.service';
import { getApiErrorMessage } from '@/utils/apiError.util';
import type { SalePayload } from '@/types/sale/sale-payload.type';

interface SalesStoreState {
  loading: boolean;
  error: string | null;
}

export const useSalesStore = defineStore('sales', {
  state: (): SalesStoreState => ({
    loading: false,
    error: null,
  }),

  actions: {
    async createSale(payload: SalePayload): Promise<unknown> {
      this.loading = true;
      this.error = null;
      try {
        const data = await createSaleService(payload);
        return data;
      } catch (err: unknown) {
        this.error = getApiErrorMessage(err, 'Falha ao enviar pedido.');
        console.error('Erro na ação createSale:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
