<script setup lang="ts">
import { computed, ref } from 'vue';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockProjects } from '@/types/teamPanel/project-mocks.type';

const blockedPausedProjects = computed(() => {
  return mockProjects.filter(p => p.status === 'pausado' || p.status === 'bloqueado');
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = parseISO(dateString);
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

// Para controlar a expansão de cada item
const expanded = ref<number[]>([]); // Array de IDs de projetos expandidos
</script>

<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 font-weight-bold">Projetos Bloqueados</v-card-title>
    <v-divider class="mb-2" />

    <v-list class="py-0" density="compact">
      <template v-if="blockedPausedProjects.length > 0">
        <v-list-item
          v-for="project in blockedPausedProjects"
          :key="project.id"
          class="pa-0"
        >
          <v-expansion-panels flat>
            <v-expansion-panel
              :title="project.name"
              :value="project.id"
              v-model="expanded"
            >
              <template v-slot:text>
                <v-card-text class="pt-0 pb-2">
                  <div class="font-weight-medium">Status:
                    <v-chip :color="project.status === 'pausado' ? 'orange' : 'red'" size="small">
                      {{ project.status === 'pausado' ? 'Pausado' : 'Bloqueado' }}
                    </v-chip>
                  </div>
                  <div class="font-weight-medium mt-1">Data Prevista: {{ formatDate(project.plannedCompletionDate) }}</div>
                  <div class="font-weight-medium mt-1">Motivo:</div>
                  <p class="text-caption text-wrap">{{ project.reason || 'N/A' }}</p>
                </v-card-text>
              </template>
              <template v-slot:actions="{ expanded }">
                <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-list-item>
      </template>
      <template v-else>
        <v-list-item>
          <v-list-item-title class="text-center text-medium-emphasis py-4">
            Nenhum projeto pausado ou bloqueado no momento.
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>

<style scoped>
/* Ajustes para a expansão, se necessário */
.v-expansion-panel-title {
  padding-left: 16px !important;
  padding-right: 16px !important;
  min-height: 48px !important; /* Altura mínima para o título */
}

.v-expansion-panel {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12); /* Separador entre os itens */
}

.v-expansion-panel:last-child {
  border-bottom: none; /* Remove borda do último item */
}
</style>