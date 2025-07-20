<script setup lang="ts">
import router from '@/router';
import { getInitials } from '@/utils/getInitialsFromName.util';
import { ref } from 'vue';

const props = defineProps<{
  rail: boolean
}>();

// Removendo a inicialização dos stores, pois não serão usados para este mock
// const authStore = useAuthStore();
// const teamStore = useTeamStore();

// --- MEMBROS FIXOS MOCKADOS ---
const teamMembers = ref([
  { uuid: 'mock-1', name: 'Alice Santos', email: 'alice.santos@example.com' },
  { uuid: 'mock-2', name: 'Bruno Mendes', email: 'bruno.mendes@example.com' },
  { uuid: 'mock-3', name: 'Carla Dias', email: 'carla.dias@example.com' },
  { uuid: 'mock-4', name: 'Daniel Rocha', email: 'daniel.rocha@example.com' },
  { uuid: 'mock-5', name: 'Eliana Lima', email: 'eliana.lima@example.com' },
  { uuid: 'mock-6', name: 'Fábio Costa', email: 'fabio.costa@example.com' },
  { uuid: 'mock-7', name: 'Gabriela Neves', email: 'gabriela.neves@example.com' },
  { uuid: 'mock-8', name: 'Henrique Alves', email: 'henrique.alves@example.com' },
]);

const goToCollaboratorPanel = (uuid: string) => {
  // *** MUDANÇA AQUI ***
  router.push({ name: 'userPanel', params: { uuid: uuid } });
};
</script>

<template>
  <div class="border-t">
    <div v-if="!rail" class="pa-2">
      <div class="d-flex align-center mb-2 team-header-container">
        <div class="text-subtitle-2 font-weight-medium mr-1 nowrap-text">Meu Time:</div>

        <v-btn color="primary" size="small" class="team-dashboard-btn" to="/system/time/hiseuhfkbeiuefiab">
          <span class="team-name-text">TechFin</span>
          <v-icon class="ml-1">mdi-speedometer</v-icon>
        </v-btn>
      </div>
      <div class="text-caption text-medium-emphasis mb-2">Membros do meu time</div>

      <v-divider class="mb-2" />

      <div
        v-for="member in teamMembers"
        :key="member.uuid"
        class="d-flex align-center mb-2 elevation-1 rounded pa-2 member-item"
        @click="goToCollaboratorPanel(member.uuid)"
      >
        <v-avatar size="28" class="mr-2" color="primary">
          <span class="text-caption font-weight-bold">{{ getInitials(member.name) }}</span>
        </v-avatar>
        <div>
          <div class="text-caption font-weight-medium member-name-text">{{ member.name }}</div>
          <div class="text-caption text-medium-emphasis">{{ member.email }}</div>
        </div>
      </div>
    </div>
    <div class="pt-2" v-else>
      <v-icon size="large" class="d-block text-center mb-2">mdi-account-group</v-icon>
      <div class="text-caption text-center text-medium-emphasis">Equipe</div>
    </div>
  </div>
</template>

<style scoped>
.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.nowrap-text {
  white-space: nowrap;
}

.team-header-container {
  max-width: 100%;
  overflow: hidden;
  flex-wrap: nowrap;
}

.team-dashboard-btn {
  min-width: 0 !important;
  flex-grow: 1;
  overflow: hidden;
}

.team-dashboard-btn .team-name-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  min-width: 0;
  max-width: 108px;
}

/* Estilos para o item do membro */
.member-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.member-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.member-item .member-name-text {
  display: inline-block;
  transition: text-decoration 0.2s ease;
}

.member-item:hover .member-name-text {
  text-decoration: underline;
}
</style>
