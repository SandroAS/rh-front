<script setup lang="ts">
import { getInitials } from '@/utils/getInitialsFromName.util';
import { ref, watch, onMounted } from 'vue';
// Não precisaremos mais dos stores de autenticação e time para este mock
// import { useAuthStore } from '@/stores/auth.store';
// import { useTeamStore } from '@/stores/team.store';

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

// Removendo os watchers e onMounted, pois a lista é fixa
// watch(() => authStore.user?.teamId, (newTeamId) => {
//   if (newTeamId) {
//     teamStore.fetchTeamMembers(newTeamId);
//   } else {
//     teamStore.teamMembers = [];
//   }
// }, { immediate: true });

// onMounted(() => {
//   if (authStore.user?.teamId) {
//     teamStore.fetchTeamMembers(authStore.user.teamId);
//   }
// });
</script>

<template>
  <div class="border-t">
    <div v-if="!rail" class="pa-2">
      <div class="d-flex align-end justify-space-between mb-2">
        <div>
          <div class="text-subtitle-2 font-weight-medium">Meu Time: <b>TechFin</b></div>
          <div class="text-caption text-medium-emphasis">Membros do meu time</div>
        </div>
      </div>
  
      <v-divider class="mb-2" />
  
      <div
        v-for="member in teamMembers"
        :key="member.uuid"
        class="d-flex align-center mb-2 elevation-1 rounded pa-2"
      >
        <v-avatar size="28" class="mr-2" color="primary">
            <span class="text-caption font-weight-bold">{{ getInitials(member.name) }}</span>
        </v-avatar>
        <div>
          <div class="text-caption font-weight-medium">{{ member.name }}</div>
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
</style>
