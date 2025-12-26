<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import EvaluationBarChart from '@/components/system/evaluation/EvaluationBarChart.vue';
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
import type EvaluationApplication from '@/types/evaluationApplication/evaluation-application.type';

const evaluationApplicationStore = useEvaluationApplicationStore();
const evaluationStore = useEvaluationStore();
const accountUserStore = useAccountUserStore();

const showChart = ref(false);

// --- Estado dos Filtros ---
const filters = ref({
  evaluationName: null,
  evaluationType: null,
  evaluated: null,
  evaluator: null,
  requestedBy: null,
  status: null,
});

// A data inicial será o primeiro dia do ano atual e a final o último dia
const today = new Date();
const firstDayOfYear = new Date(today.getFullYear(), 0, 1).toISOString().substring(0, 10);
const lastDayOfYear = new Date(today.getFullYear(), 11, 31).toISOString().substring(0, 10);
const dateRange = ref([firstDayOfYear, lastDayOfYear]);
const datePickerMenu = ref(false);

const applicationTypes = [
  { title: 'Autoavaliação', value: 'self' },
  { title: 'Avaliação por Pares', value: 'peer' },
  { title: 'Avaliação por Líder', value: 'leader' },
];
const applicationStatuses = ['pending', 'in_progress', 'completed', 'canceled'];

// --- Opções para os Filtros (preenchidas pelos stores) ---
const evaluationNameOptions = computed(() => {
  return evaluationStore.evaluations?.map(e => ({ title: e.title, value: e.uuid })) || [];
});

const userOptions = computed(() => {
  return accountUserStore.account_users?.map(u => ({ title: u.name, value: u.uuid })) || [];
});

// --- Dados do Gráfico ---
const chartData = ref({
  labels: [] as string[],
  datasets: [
    { name: 'Respondidas', data: [] as number[] },
    { name: 'Pendentes', data: [] as number[] },
    { name: 'Expiradas', data: [] as number[] },
  ],
});

const loadingData = ref(false);

const loadMetricsData = async () => {
  loadingData.value = true;
  try {
    // Busca todas as aplicações de avaliação
    await evaluationApplicationStore.getEvaluationApplications({ page: 1, limit: 10000 });
    
    const allApplications = evaluationApplicationStore.evaluation_applications;
    const filteredApplications = allApplications?.filter(app => {
      // Lógica de filtro (idêntica à anterior)
      let isMatch = true;
      if (filters.value.evaluationName && app.evaluation_uuid !== filters.value.evaluationName) isMatch = false;
      if (filters.value.evaluationType && app.type !== filters.value.evaluationType) isMatch = false;
      if (filters.value.evaluated && app.evaluated_collaborator_uuid !== filters.value.evaluated) isMatch = false;
      if (filters.value.evaluator && app.evaluator_collaborator_uuid !== filters.value.evaluator) isMatch = false;
      if (filters.value.requestedBy && app.requested_by_user_uuid !== filters.value.requestedBy) isMatch = false;
      if (filters.value.status && app.status !== filters.value.status) isMatch = false;
      
      const appDate = new Date(app.application_date);
      const startDate = new Date(dateRange.value[0]);
      const endDate = new Date(dateRange.value[1]);
      if (appDate < startDate || appDate > endDate) isMatch = false;

      return isMatch;
    });

    processChartData(filteredApplications || []);

  } catch (error) {
    console.error("Erro ao carregar dados de métricas:", error);
  } finally {
    loadingData.value = false;
  }
};

const processChartData = (applications: EvaluationApplication[]) => {
  const data = {
    labels: [] as string[],
    datasets: {
      completed: new Map<string, number>(),
      pending: new Map<string, number>(),
      expired: new Map<string, number>(),
    },
  };

  const startDate = new Date(dateRange.value[0]);
  const endDate = new Date(dateRange.value[1]);

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const monthYear = currentDate.toLocaleString('pt-BR', { month: 'short' }).charAt(0).toUpperCase() + currentDate.toLocaleString('pt-BR', { month: 'short' }).slice(1).replace('.', '') + '/' + currentDate.getFullYear().toString().slice(2);
    data.labels.push(monthYear);
    data.datasets.completed.set(monthYear, 0);
    data.datasets.pending.set(monthYear, 0);
    data.datasets.expired.set(monthYear, 0);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const today = new Date();
  applications.forEach(app => {
    const appDate = new Date(app.application_date);
    const monthYear = appDate.toLocaleString('pt-BR', { month: 'short' }).charAt(0).toUpperCase() + appDate.toLocaleString('pt-BR', { month: 'short' }).slice(1).replace('.', '') + '/' + appDate.getFullYear().toString().slice(2);
    
    if (app.status === 'completed') {
      data.datasets.completed.set(monthYear, (data.datasets.completed.get(monthYear) || 0) + 1);
    } else if (app.status === 'pending' || app.status === 'in_progress') {
      const expirationDate = new Date(appDate);
      expirationDate.setDate(expirationDate.getDate() + 30);
      
      if (today > expirationDate) {
         data.datasets.expired.set(monthYear, (data.datasets.expired.get(monthYear) || 0) + 1);
      } else {
         data.datasets.pending.set(monthYear, (data.datasets.pending.get(monthYear) || 0) + 1);
      }
    }
  });

  chartData.value.labels = data.labels;
  chartData.value.datasets[0].data = data.labels.map(label => data.datasets.completed.get(label) || 0);
  chartData.value.datasets[1].data = data.labels.map(label => data.datasets.pending.get(label) || 0);
  chartData.value.datasets[2].data = data.labels.map(label => data.datasets.expired.get(label) || 0);
};

watch(() => [
  filters.value.evaluationName,
  filters.value.evaluationType,
  filters.value.evaluated,
  filters.value.evaluator,
  filters.value.requestedBy,
  filters.value.status,
  dateRange.value,
], () => {
  loadMetricsData();
}, { deep: true });

onMounted(async () => {
  await Promise.all([
    evaluationStore.getEvaluations({ page: 1, limit: 10000 }),
    accountUserStore.getAccountUsers({ page: 1, limit: 10000 }),
    evaluationApplicationStore.getEvaluationApplications({ page: 1, limit: 10000 }),
  ]);
  loadMetricsData();
});

const filteredApplications = ref<EvaluationApplication[]>([]);

const applyFilters = async () => {
  showChart.value = false;
  loadingData.value = true; // Inicia o carregamento

  // Limpar dados anteriores
  filteredApplications.value = [];
  chartData.value.labels = [];
  chartData.value.datasets[0].data = [];
  chartData.value.datasets[1].data = [];
  chartData.value.datasets[2].data = [];
  
  try {
    await evaluationApplicationStore.getEvaluationApplications({ page: 1, limit: 10000 });
    
    const allApplications = evaluationApplicationStore.evaluation_applications;
    
    // Armazena os dados filtrados em uma variável reativa
    filteredApplications.value = allApplications?.filter(app => {
      // ... (lógica de filtro permanece a mesma)
      let isMatch = true;
      if (filters.value.evaluationName && app.evaluation_uuid !== filters.value.evaluationName) isMatch = false;
      if (filters.value.evaluationType && app.type !== filters.value.evaluationType) isMatch = false;
      if (filters.value.evaluated && app.evaluated_collaborator_uuid !== filters.value.evaluated) isMatch = false;
      if (filters.value.evaluator && app.evaluator_collaborator_uuid !== filters.value.evaluator) isMatch = false;
      if (filters.value.requestedBy && app.requested_by_user_uuid !== filters.value.requestedBy) isMatch = false;
      if (filters.value.status && app.status && app.status !== filters.value.status) isMatch = false;
      
      const appDate = new Date(app.application_date);
      const startDate = new Date(dateRange.value[0]);
      const endDate = new Date(dateRange.value[1]);
      if (appDate < startDate || appDate > endDate) isMatch = false;

      return isMatch;
    }) || [];
    
    // Processa os dados filtrados para o gráfico
    if (filteredApplications.value.length > 0) {
      processChartData(filteredApplications.value);
    }
  } catch (error) {
    console.error("Erro ao carregar dados de métricas:", error);
  } finally {
    loadingData.value = false;
    showChart.value = true;
  }
};
</script>

<template>
  <v-container fluid>
    <div class="d-flex flex-wrap gap-4 align-center mb-4">
      <v-autocomplete
        v-model="filters.evaluationName"
        :items="evaluationNameOptions"
        label="Nome da Avaliação"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="flex-grow-1"
        style="min-width: 200px;"
      ></v-autocomplete>

      <v-select
        v-model="filters.evaluationType"
        :items="applicationTypes"
        label="Tipo de Avaliação"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="flex-grow-1"
        style="min-width: 150px;"
      ></v-select>

      <v-autocomplete
        v-model="filters.evaluated"
        :items="userOptions"
        label="Avaliado"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="flex-grow-1"
        style="min-width: 200px;"
      ></v-autocomplete>

      <v-autocomplete
        v-model="filters.evaluator"
        :items="userOptions"
        label="Avaliador"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="flex-grow-1"
        style="min-width: 200px;"
      ></v-autocomplete>

      <v-autocomplete
        v-model="filters.requestedBy"
        :items="userOptions"
        label="Solicitante"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="flex-grow-1"
        style="min-width: 200px;"
      ></v-autocomplete>

      <v-select
        v-model="filters.status"
        :items="applicationStatuses"
        label="Status"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="flex-grow-1"
        style="min-width: 150px;"
      ></v-select>

      <v-menu
        v-model="datePickerMenu"
        :close-on-content-click="false"
        max-width="300px"
        min-width="auto"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            v-bind="props"
            :model-value="`${dateRange[0]} até ${dateRange[1]}`"
            label="Período"
            prepend-inner-icon="mdi-calendar"
            readonly
            variant="outlined"
            density="compact"
            hide-details
            class="flex-grow-1"
            style="min-width: 250px;"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="dateRange"
          range
          @update:model-value="datePickerMenu = false"
        ></v-date-picker>
      </v-menu>
    </div>

    <v-divider class="my-4" />

    <v-card class="pa-4" :loading="loadingData">
      <v-card-title>
        Resumo de Avaliações
        <v-icon size="small" class="ml-2">mdi-chart-bar</v-icon>
      </v-card-title>
      <v-card-text>
        <div v-if="loadingData" class="d-flex justify-center my-10">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <div v-else>
          <div v-if="chartData.datasets[0].data.length > 0">
             <EvaluationBarChart :chart-data="chartData" />
          </div>
          <v-alert v-else type="info" variant="tonal">
            Nenhum dado encontrado para o período e filtros selecionados.
          </v-alert>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
