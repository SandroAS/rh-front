<script setup lang="ts">
import { computed } from 'vue';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { User } from '@/types/teamPanel/project-mocks.type';

const props = defineProps<{
  user: User;
}>();

const formattedAdmissionDate = computed(() => {
  return props.user.admissionDate ? format(parseISO(props.user.admissionDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
});

const formattedLastFeedbackDate = computed(() => {
  return props.user.lastFeedbackDate ? format(parseISO(props.user.lastFeedbackDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
});

const getEngagementColor = (engagement: string) => {
  switch (engagement) {
    case 'Alto Engajamento': return 'green-darken-2';
    case 'Engajamento Moderado': return 'orange-darken-2';
    case 'Baixo Engajamento': return 'red-darken-2';
    default: return 'grey';
  }
};
const getEngagementIcon = (engagement: string) => {
  switch (engagement) {
    case 'Alto Engajamento': return 'mdi-trending-up';
    case 'Engajamento Moderado': return 'mdi-trending-flat';
    case 'Baixo Engajamento': return 'mdi-trending-down';
    default: return 'mdi-information-outline';
  }
};
</script>

<template>
  <v-card elevation="2" class="pa-4 user-profile-card">
    <div class="d-flex flex-column align-center mb-4">
      <v-avatar size="100" class="mb-3">
        <v-img :src="user.profilePicture" :alt="user.name"></v-img>
      </v-avatar>
      <div class="text-h5 font-weight-bold">{{ user.name }}</div>
      <div class="text-subtitle-1 text-medium-emphasis">{{ user.role }}</div>
      <v-chip
        :color="getEngagementColor(user.engagement)"
        density="compact"
        class="mt-2"
        label
      >
        <v-icon start :icon="getEngagementIcon(user.engagement)"></v-icon>
        {{ user.engagement }}
      </v-chip>
    </div>

    <v-divider class="mb-4"></v-divider>

    <div class="d-flex align-center mb-2">
      <v-icon start icon="mdi-email-outline"></v-icon>
      <div class="text-body-2">{{ user.email }}</div>
    </div>
    <div class="d-flex align-center mb-2">
      <v-icon start icon="mdi-calendar-range"></v-icon>
      <div class="text-body-2">Admissão: {{ formattedAdmissionDate }}</div>
    </div>
    <div class="d-flex align-center">
      <v-icon start icon="mdi-message-text-outline"></v-icon>
      <div class="text-body-2">Último feedback: {{ formattedLastFeedbackDate }}</div>
    </div>
  </v-card>
</template>

<style scoped>
.user-profile-card {
  height: 100%; /* Garante que o card ocupe todo o espaço disponível na coluna */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centraliza o conteúdo verticalmente */
}
</style>
