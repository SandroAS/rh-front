<script setup lang="ts">
import { computed } from 'vue';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockProjects } from '@/types/teamPanel/project-mocks.type';

const projectsInProgress = computed(() => {
  return mockProjects.filter(p => p.status === 'em_andamento' && p.plannedCompletionDate).sort((a, b) => {
    // Ordena pela data prevista de entrega (mais próximos primeiro)
    if (!a.plannedCompletionDate || !b.plannedCompletionDate) return 0;
    return parseISO(a.plannedCompletionDate).getTime() - parseISO(b.plannedCompletionDate).getTime();
  });
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = parseISO(dateString);
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};
</script>

<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 font-weight-bold">Projetos em Andamento</v-card-title>
    <v-divider class="mb-2" />

    <v-table>
      <thead>
        <tr>
          <th>Nome do Projeto</th>
          <th class="text-right">Data Prevista</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in projectsInProgress" :key="project.id">
          <td>{{ project.name }}</td>
          <td class="text-right">{{ formatDate(project.plannedCompletionDate) }}</td>
        </tr>
        <tr v-if="projectsInProgress.length === 0">
          <td colspan="2" class="text-center text-medium-emphasis">Nenhum projeto em andamento no momento.</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
