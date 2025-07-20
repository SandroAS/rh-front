<script setup lang="ts">
import { ref, computed } from 'vue';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockProjects } from '@/types/teamPanel/project-mocks.type';

const allCompletedProjects = computed(() => {
  return mockProjects.filter(p => p.status === 'concluido' && p.actualCompletionDate);
});

// Filtros de data
const filtroMes = ref<number | null>(null);
const filtroAno = ref<number | null>(null);

const anosDisponiveis = computed(() => {
  const years = new Set<number>();
  allCompletedProjects.value.forEach(p => {
    if (p.actualCompletionDate) {
      years.add(parseISO(p.actualCompletionDate).getFullYear());
    }
  });
  return Array.from(years).sort((a, b) => b - a); // Anos em ordem decrescente
});

const meses = [
  { label: 'Janeiro', value: 0 },
  { label: 'Fevereiro', value: 1 },
  { label: 'Março', value: 2 },
  { label: 'Abril', value: 3 },
  { label: 'Maio', value: 4 },
  { label: 'Junho', value: 5 },
  { label: 'Julho', value: 6 },
  { label: 'Agosto', value: 7 },
  { label: 'Setembro', value: 8 },
  { label: 'Outubro', value: 9 },
  { label: 'Novembro', value: 10 },
  { label: 'Dezembro', value: 11 },
];

const filteredCompletedProjects = computed(() => {
  return allCompletedProjects.value.filter(project => {
    if (!project.actualCompletionDate) return false;

    const projectDate = parseISO(project.actualCompletionDate);
    const projectMonth = projectDate.getMonth();
    const projectYear = projectDate.getFullYear();

    const matchesMonth = filtroMes.value === null || projectMonth === filtroMes.value;
    const matchesYear = filtroAno.value === null || projectYear === filtroAno.value;

    return matchesMonth && matchesYear;
  }).sort((a, b) => {
    // Ordena do mais recente para o mais antigo
    if (!a.actualCompletionDate || !b.actualCompletionDate) return 0;
    return parseISO(b.actualCompletionDate).getTime() - parseISO(a.actualCompletionDate).getTime();
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
    <v-card-title class="text-h6 font-weight-bold">Entregas Concluídas</v-card-title>
    <v-divider class="mb-2" />
    <div class="mb-4">
      <div class="d-flex gap-2 align-center">
        <v-select
          v-model="filtroMes"
          :items="meses"
          item-title="label"
          item-value="value"
          label="Mês"
          clearable
          density="compact"
          hide-details
          class="mr-2"
        />
        <v-select
          v-model="filtroAno"
          :items="anosDisponiveis"
          label="Ano"
          clearable
          density="compact"
          hide-details
        />
      </div>
    </div>

    <v-table>
      <thead>
        <tr>
          <th>Nome do Projeto</th>
          <th class="text-right">Data de Conclusão</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in filteredCompletedProjects" :key="project.id">
          <td>{{ project.name }}</td>
          <td class="text-right">{{ formatDate(project.actualCompletionDate) }}</td>
        </tr>
        <tr v-if="filteredCompletedProjects.length === 0">
          <td colspan="2" class="text-center text-medium-emphasis">Nenhum projeto concluído encontrado para o período ou filtros selecionados.</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
