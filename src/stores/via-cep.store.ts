import { defineStore } from 'pinia';
import { viaCepService, type ViaCepResponse } from '@/services/via-cep.service';

interface ViaCepState {
  lastAddress: ViaCepResponse | null;
  loading: boolean;
  error: string | null;
}

export const useViaCepStore = defineStore('viaCep', {
  state: (): ViaCepState => ({
    lastAddress: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
      const cleaned = cep.replace(/\D/g, '');
      if (cleaned.length !== 8) {
        this.lastAddress = null;
        this.error = 'CEP deve ter 8 dígitos';
        return null;
      }
      this.loading = true;
      this.error = null;
      try {
        const data = await viaCepService.getAddressByCep(cleaned);
        this.lastAddress = data;
        if (!data) this.error = 'CEP não encontrado';
        return data;
      } catch (err) {
        this.error = 'Falha ao buscar CEP';
        this.lastAddress = null;
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
