import { defineStore } from 'pinia';
import { ref } from 'vue';

interface TeamMember {
  uuid: string;
  name: string;
  email: string;
}

export const useTeamStore = defineStore('team', () => {
  const teamMembers = ref<TeamMember[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTeamMembers = async (teamId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (teamId === 'team-abc-123') {
        teamMembers.value = [
          { uuid: 'member-1', name: 'João Silva', email: 'joao.silva@exemplo.com' },
          { uuid: 'member-2', name: 'Maria Souza', email: 'maria.souza@exemplo.com' },
          { uuid: 'member-3', name: 'Pedro Santos', email: 'pedro.santos@exemplo.com' },
        ];
      } else {
        teamMembers.value = []; // Nenhum membro encontrado para este time
      }
    } catch (err: any) {
      error.value = err.message || 'Falha ao carregar membros do time.';
    } finally {
      loading.value = false;
    }
  };

  return { teamMembers, loading, error, fetchTeamMembers };
});