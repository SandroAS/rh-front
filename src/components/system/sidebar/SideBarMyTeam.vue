<script setup lang="ts">
import { onMounted, computed } from 'vue';
import router from '@/router';
import { getInitials } from '@/utils/getInitialsFromName.util';
import { useTeamStore } from '@/stores/team.store';

const props = defineProps<{
  rail: boolean
}>();

const teamStore = useTeamStore();

const team = computed(() => teamStore.user_logged_team);
const teamMembers = computed(() => {
  if (!team.value?.teamMembers) return [];
  return team.value.teamMembers.map(member => ({
    uuid: member.user.uuid,
    name: member.user.name,
    email: member.user.email || ''
  }));
});

const goToCollaboratorPanel = (uuid: string) => {
  router.push({ name: 'userPanel', params: { uuid: uuid } });
};

onMounted(async () => {
  if (!teamStore.user_logged_team) {
    await teamStore.getUserLoggedTeam();
  }
});
</script>

<template>
  <div class="border-t">
    <div v-if="!rail" class="pa-2" style="overflow-y: auto; height: 364px;">
      <div v-if="team" class="d-flex align-center mb-2 team-header-container">
        <div class="text-subtitle-2 font-weight-medium mr-1 nowrap-text">Meu Time:</div>

        <v-btn 
          color="primary" 
          size="small" 
          class="team-dashboard-btn" 
          :to="`/system/time/${team.uuid}`"
        >
          <span class="team-name-text">{{ team.name }}</span>
          <v-icon class="ml-1">mdi-speedometer</v-icon>
        </v-btn>
      </div>
      <div v-else class="mb-2">
        <v-btn 
          color="primary" 
          size="small" 
          class="w-100" 
          :to="{ name: 'settings', query: { tab: 'teams' } }"
        >
          <v-icon class="mr-1">mdi-account-group</v-icon>
          Ver Times
        </v-btn>
        <div class="text-caption text-medium-emphasis text-center mt-1">
          Você ainda não faz parte de um time, crie ou entre em algum
        </div>
      </div>
      <div v-if="team" class="text-caption text-medium-emphasis mb-2">Membros do meu time</div>

      <v-divider v-if="team" class="mb-2" />

      <div v-if="team && teamMembers.length > 0">
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
            <div class="text-caption text-medium-emphasis text-warp">{{ member.email }}</div>
          </div>
        </div>
      </div>
      <div v-else-if="team" class="text-caption text-medium-emphasis text-center pa-2">
        Nenhum membro encontrado
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

.text-warp {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 155px;
}
</style>
