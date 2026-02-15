<script setup lang="ts">
import { computed } from 'vue';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { UserPanel } from '@/types/user/user-panel.type';
import type { UserPanelEvaluationReceived } from '@/types/user/user-panel.type';

const props = defineProps<{
  user: UserPanel;
}>();

type TimelineItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: string;
  submittedBy?: string;
};

const timelineItems = computed<TimelineItem[]>(() => {
  const evaluations = props.user.evaluationsReceived ?? [];
  return evaluations.map((ev: UserPanelEvaluationReceived) => ({
    id: ev.uuid,
    type: ev.type?.toLowerCase() ?? 'evaluation',
    title: ev.name,
    description: ev.description ?? '',
    date: ev.finished_at ?? ev.started_date ?? ev.expiration_date ?? '',
    status: ev.status,
    submittedBy: ev.submittingUser?.name,
  }));
});

const sortedTimeline = computed(() => {
  return [...timelineItems.value].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return parseISO(b.date).getTime() - parseISO(a.date).getTime();
  });
});

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateString;
  }
};

const getTimelineIcon = (type: string) => {
  switch (type) {
    case 'self': return 'mdi-account-check-outline';
    case 'subordinate': return 'mdi-account-group-outline';
    case 'peer': return 'mdi-account-multiple-outline';
    case 'leader': return 'mdi-account-supervisor-outline';
    case 'client': return 'mdi-account-tie-outline';
    default: return 'mdi-clipboard-check-outline';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    CREATED: 'Criada',
    SENDED: 'Enviada',
    ACCESSED: 'Acessada',
    IN_PROGRESS: 'Em progresso',
    FINISHED: 'Finalizada',
    CANCELED: 'Cancelada',
    EXPIRED: 'Expirada',
  };
  return labels[status] ?? status;
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    SELF: 'Autoavaliação',
    SUBORDINATE: 'Subordinado',
    PEER: 'Par',
    LEADER: 'Líder',
    CLIENT: 'Cliente',
    OTHER: 'Outro',
  };
  return labels[type?.toUpperCase()] ?? type ?? 'Avaliação';
};
</script>

<template>
  <v-card elevation="2" class="pa-4 user-timeline-card overflow-y-auto" style="max-height: 368px;">
    <v-card-title class="text-h6 font-weight-bold">Avaliações recebidas</v-card-title>
    <v-divider class="mb-4"></v-divider>

    <v-list class="py-0" v-if="sortedTimeline.length > 0">
      <v-list-item
        v-for="event in sortedTimeline"
        :key="event.id"
        class="mb-2 py-0"
        density="compact"
      >
        <div class="d-flex align-center flex-wrap">
          <v-icon start :icon="getTimelineIcon(event.type)" color="primary"></v-icon>
          <div class="flex-grow-1 min-width-0">
            <div class="font-weight-medium">{{ event.title }}</div>
            <div v-if="event.description" class="text-caption text-medium-emphasis">{{ event.description }}</div>
            <div class="text-caption text-medium-emphasis mt-1">
              <v-chip size="x-small" variant="tonal" class="mr-1">{{ getTypeLabel(event.type) }}</v-chip>
              <v-chip size="x-small" variant="outlined">{{ getStatusLabel(event.status) }}</v-chip>
              <span v-if="event.submittedBy" class="ml-1"> · {{ event.submittedBy }}</span>
            </div>
          </div>
          <div class="text-caption text-medium-emphasis ml-4 shrink-0">{{ formatDate(event.date) }}</div>
        </div>
      </v-list-item>
    </v-list>
    <div v-else class="text-center text-medium-emphasis pa-4">
      Nenhuma avaliação recebida.
    </div>
  </v-card>
</template>

<style scoped>
.user-timeline-card {
  height: 100%;
}
.min-width-0 {
  min-width: 0;
}
</style>
