import { getLevelsGroups } from '@/services/levels-group.service';
import type LevelsGroup from '@/types/levelsGroup/levels-group.type';
import { defineStore } from 'pinia';

interface LevelsGroupStoreState {
  levels_groups: LevelsGroup[] | null;
  loading: boolean;
  error: string | null;
}

export const useLevelsGroupStore = defineStore('levelsGroup', {
  state: (): LevelsGroupStoreState => ({
    levels_groups: null,
    loading: false,
    error: null
  }),

  getters: {
    levelsGroupsOptions(): { value: LevelsGroup, title: string, disabled?: boolean }[] | [] {
      if(!this.levels_groups) return [];
      const levelsGroupsMapped = this.levels_groups.map(level_group => {
        return {
          value: level_group,
          title: level_group.name,
        }
      });
      return levelsGroupsMapped;
    }
  },

  actions: {
    async getLevelsGroups() {
      this.loading = true;
      this.error = null;

      try {
       this.levels_groups = await getLevelsGroups();
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erro ao tentar atualizar serviço.';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
