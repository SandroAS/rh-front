<script setup lang="ts">
import { computed } from 'vue';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { User } from '@/types/teamPanel/project-mocks.type';

const props = defineProps<{
  user: User;
}>();

const sortedTimeline = computed(() => {
  return [...props.user.timeline].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
});

const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
};

const getTimelineIcon = (type: string) => {
  switch (type) {
    case 'feedback': return 'mdi-comment-text-multiple-outline';
    case 'projeto': return 'mdi-briefcase-outline';
    case 'capacitacao': return 'mdi-school-outline';
    case 'promocao': return 'mdi-medal-outline';
    default: return 'mdi-information-outline';
  }
};
</script>

<template>
  <v-card elevation="2" class="pa-4 user-timeline-card">
    <v-card-title class="text-h6 font-weight-bold">Check-ins Recentes</v-card-title>
    <v-divider class="mb-4"></v-divider>

    <v-list class="py-0" v-if="sortedTimeline.length > 0">
      <v-list-item
        v-for="event in sortedTimeline"
        :key="event.id"
        class="mb-2 py-0"
        density="compact"
      >
        <div class="d-flex align-center">
          <v-icon start :icon="getTimelineIcon(event.type)" color="primary"></v-icon>
          <div class="flex-grow-1">
            <div class="font-weight-medium">{{ event.title }}</div>
            <div class="text-caption text-medium-emphasis">{{ event.description }}</div>
          </div>
          <div class="text-caption text-medium-emphasis ml-4">{{ formatDate(event.date) }}</div>
        </div>
      </v-list-item>
    </v-list>
    <div v-else class="text-center text-medium-emphasis pa-4">
      Nenhum evento recente na timeline.
    </div>
  </v-card>
</template>

<style scoped>
.user-timeline-card {
  height: 100%; /* Garante que o card ocupe todo o espaço disponível na coluna */
}
</style>
