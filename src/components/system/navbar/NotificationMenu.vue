<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from '@/plugins/dayjs.ts'

interface Notification {
  id: number
  title: string
  createdAt: string
  read: boolean
}

const notifications = ref<Notification[]>([
  { id: 1, title: 'Paciente João Silva reagendou a consulta', createdAt: '2025-05-20T09:45:00Z', read: false },
  { id: 2, title: 'Novo agendamento: Maria Oliveira - 21/05 às 14h', createdAt: '2025-05-20T08:30:00Z', read: false },
  { id: 3, title: 'Fatura da clínica foi paga com sucesso', createdAt: '2025-05-19T15:00:00Z', read: true },
  { id: 4, title: 'Paciente Carlos Mendes cancelou a consulta', createdAt: '2025-05-19T11:00:00Z', read: false },
  { id: 5, title: 'Novo paciente cadastrado: Ana Paula', createdAt: '2025-05-18T18:20:00Z', read: true },
  { id: 6, title: 'Consulta de Lucas Martins confirmada', createdAt: '2025-05-17T10:00:00Z', read: true },
  { id: 7, title: 'Relatório mensal de atendimentos disponível', createdAt: '2025-05-17T08:45:00Z', read: false },
])

const updates = [
  {
    time: 'Há 2 horas',
    description: 'Paciente João Silva realizou um novo agendamento.',
  },
  {
    time: 'Há 5 horas',
    description: 'Prontuário da paciente Maria Oliveira foi atualizado.',
    link: '#',
  },
  {
    time: 'Ontem',
    description: 'Novo paciente cadastrado: Ana Paula.',
  },
  {
    time: '2 dias atrás',
    description:
      'Consulta de limpeza dental finalizada para o paciente Lucas Martins.',
  },
  {
    time: '3 dias atrás',
    description:
      'Dentista Dra. Fernanda adicionada ao quadro clínico da unidade.',
    link: '#',
  },
];

// Agrupa por data legível
const groupedNotifications = computed(() => {
  const groups: Record<string, Notification[]> = {}

  notifications.value.forEach(n => {
    const date = dayjs(n.createdAt)
    let label = date.format('DD/MM/YYYY')

    if (date.isToday()) label = 'Hoje'
    else if (date.isYesterday()) label = 'Ontem'

    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })

  return groups
})

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
</script>

<template>
  <v-menu offset-y :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn icon v-bind="props" class="ml-2">
        <v-badge
          :content="unreadCount"
          v-if="unreadCount > 0"
          color="red"
          overlap
          dot
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell-outline</v-icon>
      </v-btn>
    </template>

    <v-card style="min-width: 300px; max-width: 400px;">
      <v-card-title class="text-subtitle-1 font-weight-bold">Notificações</v-card-title>
      <v-divider />

      <v-card-text style="max-height: 300px; overflow-y: auto;">
        <template v-for="[group, items] in Object.entries(groupedNotifications)" :key="group">
          <div class="text-caption text-medium-emphasis mt-2 mb-1">{{ group }}</div>
          <v-list
            class="mx-auto pe-4"
            style="max-width: 380px"
            rounded
            density="default"
          >
            <v-timeline
              align="start"
              side="end"
              truncate-line="start"
              density="compact"
            >
              <v-timeline-item
                v-for="(event, index) in updates"
                :key="index"
                dot-color="primary"
                fill-dot
                size="12"
                :line-inset="0"
              >
                <v-card flat class="bg-transparent">
                  <v-card-text class="pa-0">
                    <span class="text-caption text-medium-emphasis">
                      {{ event.time }}
                    </span>
                    <div class="mb-1">{{ event.description }}</div>
                    <div v-if="event.link">
                      <a
                        :href="event.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-decoration-none text-medium-emphasis"
                      >
                        <small>Ver detalhes →</small>
                      </a>
                    </div>
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-list>
        </template>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<style>
/* .v-timeline-divider__after {
  height: 100%;
} */
</style>