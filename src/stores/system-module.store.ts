import { getSystemModules } from '@/services/sytem-module.service';
import type { SystemModule } from '@/types/systemModule/system-module.type';
import formatSystemModuleName from '@/utils/formatSystemModuleName.util';
import { defineStore } from 'pinia';

interface ServiceStoreState {
  system_modules: SystemModule[] | null;
  loading: boolean;
  error: string | null;
}

export enum SystemModuleName {
  DENTISTRY = 'DENTISTRY',
  PSYCHOLOGY = 'PSYCHOLOGY',
  NUTRITION = 'NUTRITION',
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
}

export const useSystemModuleStore = defineStore('systemModule', {
  state: (): ServiceStoreState => ({
    system_modules: null,
    loading: false,
    error: null
  }),

  getters: {
    systemModulesOptions(): { value: SystemModule, title: string, disabled: boolean }[] | [] {
      if(!this.system_modules) return [];
      const systemModulesMapped = this.system_modules.map(system_module => {
        return {
          value: system_module,
          title: formatSystemModuleName(system_module.name as SystemModuleName),
          disabled: system_module.name !== SystemModuleName.DENTISTRY
        }
      });
      return systemModulesMapped;
    }
  },

  actions: {
    async getSystemModules() {
      this.loading = true;
      this.error = null;

      try {
       this.system_modules = await getSystemModules();
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
