<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed } from 'vue';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
import EvaluationLineChart from '@/components/system/evaluation/EvaluationLineChart.vue';
import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type';
import type GroupedMetric from '@/types/evaluationMetrics/grouped-metric.type';
import type EvaluationMetricApplication from '@/types/evaluationMetrics/evaluation-metric-application.type';
import { getInitials } from '@/utils/getInitialsFromName.util';
import { formatDate } from '@/utils/formatDate.util';
import FormResponsesModal from '@/components/system/evaluation/FormResponsesModal.vue';
import TextResponsesSection from '@/components/system/evaluation/TextResponsesSection.vue';

const evaluationApplicationStore = useEvaluationApplicationStore();
const evaluationStore = useEvaluationStore();
const accountUserStore = useAccountUserStore();

const loadingData = ref(false);
const dialogFormResponses = ref(false);
const selectedApplications = ref<EvaluationMetricApplication[]>([]);

const today = new Date();
const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 12, today.getDate());

const dateRange = ref<Date[]>([twelveMonthsAgo, today]);
const datePickerMenu = ref(false);

const dateRangeText = computed(() => {
  if (!dateRange.value || dateRange.value.length === 0) return '';
  const sorted = [...dateRange.value].sort((a, b) => a.getTime() - b.getTime());
  const start = formatDate(sorted[0]);
  if (sorted.length === 1) return start;
  const end = formatDate(sorted[1]);
  return `${start} até ${end}`;
});

// Converte Date para ISO 8601 (formato esperado pela API)
function dateToISO8601(date: Date): string {
  // Garante que a data está normalizada (sem hora, minutos, segundos)
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return normalizedDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

const filters = reactive<{
  name: string | null;
  type: EvaluationType | null;
  evaluated_user_uuid: string | null;
  submitted_user_uuid: string | null;
  start_date: string | null;
  end_date: string | null;
}>({
  name: null,
  type: null,
  evaluated_user_uuid: null,
  submitted_user_uuid: null,
  start_date: dateToISO8601(twelveMonthsAgo),
  end_date: dateToISO8601(today),
});

const applicationTypeOptions = [
  { title: 'Autoavaliação', value: EvaluationType.SELF },
  { title: 'Avaliação por Pares', value: EvaluationType.PEER },
  { title: 'Avaliação por Líder', value: EvaluationType.LEADER },
  { title: 'Avaliação por Liderado', value: EvaluationType.SUBORDINATE },
];

const groupedMetrics = ref<GroupedMetric[]>([]);


async function loadMetricsData(isOnMounted: boolean = false) {
  loadingData.value = true;

  if (!isOnMounted && dateRange.value.length > 0) {
    const sorted = [...dateRange.value].sort((a, b) => a.getTime() - b.getTime());
    // Converte as datas para ISO 8601 antes de enviar para a API
    filters.start_date = dateToISO8601(sorted[0]);
    filters.end_date = sorted[1] ? dateToISO8601(sorted[1]) : filters.start_date;
  }

  // Se start_date e end_date forem iguais, não chama a API
  if (filters.start_date && filters.end_date && filters.start_date === filters.end_date) {
    loadingData.value = false;
    return;
  }

  try {
    const { name, type, evaluated_user_uuid, submitted_user_uuid, start_date, end_date } = filters;
    await evaluationApplicationStore.getEvaluationApplicationsFilterMetrics(
      name, type, evaluated_user_uuid, submitted_user_uuid, start_date, end_date
    );

    const allApplications = evaluationApplicationStore.evaluation_applications || [];
    const groups: Record<string, any> = {};

    allApplications.forEach(app => {
      const evaluationName = app.evaluation?.name || "Avaliação Sem Nome";
      if (!groups[evaluationName]) {
        groups[evaluationName] = {
          name: evaluationName,
          applications: [],
          stats: {},
          chartData: { labels: [], datasets: [] }
        };
      }
      groups[evaluationName].applications.push(app);
    });

    groupedMetrics.value = Object.values(groups).map(group => {
      const topicAverages: Record<string, { sum: number, count: number, questions: Record<string, { sum: number, count: number, topicUuid?: string, topicTitle?: string }> }> = {};
      const timelineMap: Record<string, Record<string, { sum: number, count: number }>> = {};
      
      // Mapa para o gráfico de tópicos
      const topicsTimelineMap: Record<string, Record<string, { sum: number, count: number }>> = {};
      const topicsMap: Record<string, string> = {}; // base_form_topic_uuid -> topic title
      
      const months: string[] = [];

      let current = new Date(filters.start_date || twelveMonthsAgo);
      const end = new Date(filters.end_date || today);
      while (current <= end) {
        const label = current.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        if (!months.includes(label)) months.push(label);
        timelineMap[label] = {};
        topicsTimelineMap[label] = {};
        current.setMonth(current.getMonth() + 1);
      }

      group.applications.forEach((app: any) => {
        const appDate = new Date(app.started_date);
        const monthLabel = appDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });

        app.formResponses?.forEach((resp: any) => {
          resp.answers?.forEach((answer: any) => {
            if (answer.question?.type === 'RATE' && answer.number_value !== null) {
              const val = parseFloat(answer.number_value);
              
              // Processamento para stats (mantém "Geral" como chave única)
              const topic = "Geral";
              if (!topicAverages[topic]) {
                topicAverages[topic] = { 
                  sum: 0, 
                  count: 0, 
                  questions: {}
                };
              }
              topicAverages[topic].sum += val;
              topicAverages[topic].count += 1;
              
              const qTitle = answer.question.title;
              const baseTopicUuid = answer.question?.applicationTopic?.base_form_topic_uuid;
              const topicTitle = answer.question?.applicationTopic?.title;
              
              if (!topicAverages[topic].questions[qTitle]) {
                topicAverages[topic].questions[qTitle] = { 
                  sum: 0, 
                  count: 0,
                  topicUuid: baseTopicUuid,
                  topicTitle: topicTitle
                };
              }
              topicAverages[topic].questions[qTitle].sum += val;
              topicAverages[topic].questions[qTitle].count += 1;
              
              // Processamento para o gráfico geral (mantém "Geral" para compatibilidade)
              if (timelineMap[monthLabel]) {
                if (!timelineMap[monthLabel][topic]) timelineMap[monthLabel][topic] = { sum: 0, count: 0 };
                timelineMap[monthLabel][topic].sum += val;
                timelineMap[monthLabel][topic].count += 1;
              }

              // Processamento para o gráfico de tópicos
              if (baseTopicUuid && topicTitle) {
                // Armazena o título do tópico
                if (!topicsMap[baseTopicUuid]) {
                  topicsMap[baseTopicUuid] = topicTitle;
                }
                
                // Processa os dados por tópico
                if (topicsTimelineMap[monthLabel]) {
                  if (!topicsTimelineMap[monthLabel][baseTopicUuid]) {
                    topicsTimelineMap[monthLabel][baseTopicUuid] = { sum: 0, count: 0 };
                  }
                  topicsTimelineMap[monthLabel][baseTopicUuid].sum += val;
                  topicsTimelineMap[monthLabel][baseTopicUuid].count += 1;
                }
              }
            }
          });
        });
      });

      // Dataset para o gráfico geral
      const datasets = Object.keys(topicAverages).map((topic, index) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        return {
          label: topic,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length],
          data: months.map(m => {
            const data = timelineMap[m] ? timelineMap[m][topic] : null;
            return data && data.count > 0 ? parseFloat((data.sum / data.count).toFixed(2)) : null;
          }),
          fill: false,
          tension: 0.3
        };
      });

      // Dataset para o gráfico de tópicos
      const topicsDatasets = Object.keys(topicsMap).map((baseTopicUuid, index) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
        return {
          label: topicsMap[baseTopicUuid],
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length],
          data: months.map(m => {
            const data = topicsTimelineMap[m] ? topicsTimelineMap[m][baseTopicUuid] : null;
            return data && data.count > 0 ? parseFloat((data.sum / data.count).toFixed(2)) : null;
          }),
          fill: false,
          tension: 0.3
        };
      });

      return { 
        ...group, 
        stats: topicAverages, 
        chartData: { labels: months, datasets },
        topicsChartData: { labels: months, datasets: topicsDatasets }
      };
    });

  } catch (error) {
    console.error("Erro ao carregar métricas:", error);
  } finally {
    loadingData.value = false;
  }
}

const openFormResponsesModal = (group: GroupedMetric) => {
  // Passa todas as aplicações do grupo para o modal
  selectedApplications.value = group.applications;
  dialogFormResponses.value = true;
};

const groupQuestionsByTopic = (questions: Record<string, any>) => {
  const grouped: Record<string, Array<{title: string, data: any}>> = {};
  Object.entries(questions).forEach(([qTitle, qData]: [string, any]) => {
    const key = qData.topicUuid || 'sem-topico';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push({ title: qTitle, data: qData });
  });
  return grouped;
};

const handleDateRangeUpdate = (val: any) => {
  if (!val || val.length === 0) {
    dateRange.value = [];
    return;
  }

  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  if (val.length === 1) {
    dateRange.value = [normalizeDate(val[0])];
    return;
  }

  const sorted = [...val].sort((a: Date, b: Date) => a.getTime() - b.getTime());
  
  // Se há apenas uma data, mantém apenas ela (usuário ainda está selecionando)
  if (sorted.length === 1) {
    dateRange.value = [normalizeDate(sorted[0])];
    return;
  }

  // Se há duas ou mais datas, pega apenas a primeira e última (início e fim do intervalo)
  const startDate = normalizeDate(sorted[0]);
  const endDate = normalizeDate(sorted[sorted.length - 1]);
  
  dateRange.value = [startDate, endDate];

  // Só fecha o menu quando tiver um intervalo completo (duas datas distintas)
  if (dateRange.value.length === 2 && startDate.getTime() !== endDate.getTime()) {
    datePickerMenu.value = false;
  }
};

let debounceTimer: any;
watch(() => [filters.name, filters.type, filters.evaluated_user_uuid, dateRange.value], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadMetricsData();
  }, 500);
});

onMounted(async () => {
  await Promise.all([
    evaluationStore.getAllEvaluations(),
    accountUserStore.getAllAccountUsers()
  ]);
  loadMetricsData(true);
});
</script>

<template>
  <v-container fluid class="bg-grey-lighten-4 fill-height align-start">
    <v-card class="mb-6 w-100 pa-4" elevation="1">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.name"
            label="Buscar por nome da avaliação"
            variant="solo-filled"
            density="compact"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-menu v-model="datePickerMenu" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="dateRangeText"
                label="Período"
                prepend-inner-icon="mdi-calendar"
                readonly
                variant="solo-filled"
                density="compact"
                hide-details
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dateRange"
              multiple="range"
              @update:model-value="handleDateRangeUpdate"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="filters.evaluated_user_uuid"
            label="Avaliado"
            :items="accountUserStore.accountUsersOptions"
            color="blue-grey-lighten-2"
            item-title="title"
            item-value="value"
            variant="solo-filled"
            density="compact"
            clearable
            hide-details
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-if="item.raw.avatar"
                v-bind="props"
                :prepend-avatar="item.raw.avatar"
                :title="item.raw.title"
                density="compact"
              ></v-list-item>
              <v-list-item v-else
                v-bind="props"
                :title="item.raw.title"
                density="compact"
                class="py-0"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="35">
                    <span class="text-white">{{ getInitials(item.raw.title) }}</span>
                  </v-avatar>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.type"
            :items="applicationTypeOptions"
            label="Tipo"
            variant="solo-filled"
            density="compact"
            hide-details
            clearable
          ></v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading State -->
    <div v-if="loadingData" class="w-100 d-flex justify-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <div v-else-if="groupedMetrics.length === 0" class="w-100 text-center py-10">
      <v-alert type="info" variant="tonal">Nenhum dado encontrado.</v-alert>
    </div>

    <!-- Listagem de Cards de Avaliação -->
    <div v-else class="w-100">
      <v-card 
        v-for="(group, idx) in groupedMetrics" 
        :key="idx" 
        class="mb-8"
        elevation="2"
        rounded="lg"
      >
        <v-toolbar color="secondary" dark>
          <v-toolbar-title class="text-h6">{{ group.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <div class="d-flex align-center mr-4">
            <v-chip color="white" size="small" class="mr-2 text-white" variant="outlined">
              {{ group.applications.reduce((total, app) => total + (app.formResponses?.length || 0), 0) }} Respostas
            </v-chip>
            <v-btn
              icon
              size="small"
              variant="text"
              color="white"
              @click="openFormResponsesModal(group)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </div>
        </v-toolbar>

        <v-row class="pa-6">
          <v-col cols="12" lg="12">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="amber-darken-2" class="mr-2">mdi-star</v-icon>
              Desempenho Médio por Pergunta
            </h3>
            <v-expansion-panels variant="accordion">
              <v-expansion-panel v-for="(tData, tKey) in group.stats" :key="tKey">
                <v-expansion-panel-title>
                  <div class="d-flex justify-space-between w-100 pr-4 align-center">
                    <span class="font-weight-medium">{{ tKey }}</span>
                    <v-rating
                      half-increments
                      hover
                      :length="5"
                      :size="32"
                      :model-value="(tData.sum / tData.count).toFixed(2)"
                      active-color="primary"
                      readonly
                    />
                    <v-chip size="small" color="success" class="font-weight-bold">
                      {{ (tData.sum / tData.count).toFixed(2) }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list density="compact">
                    <template v-for="(topicGroup, topicUuid) in groupQuestionsByTopic(tData.questions)" :key="topicUuid">
                      <v-list-subheader v-if="topicGroup[0]?.data?.topicTitle" class="text-caption text-medium-emphasis" style="font-size: 0.7rem; height: auto; padding-left: 0 !important;">
                        {{ topicGroup[0].data.topicTitle }}
                      </v-list-subheader>
                      <v-list-item v-for="(item, idx) in topicGroup" :key="`${topicUuid}-${idx}`" class="pr-0">
                        <v-list-item-title class="text-body-2 text-wrap pr-4">{{ item.title }}</v-list-item-title>
                        <template v-slot:append>
                          <v-rating
                            half-increments
                            hover
                            :length="5"
                            :size="32"
                            :model-value="(item.data.sum / item.data.count).toFixed(2)"
                            active-color="primary"
                            readonly
                            class="mr-4"
                          />
                          <div>
                            <span class="text-body-2 font-weight-bold">{{ (item.data.sum / item.data.count).toFixed(2) }}</span>
                          </div>
                        </template>
                      </v-list-item>
                    </template>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>

          <TextResponsesSection :applications="group.applications" />

          <!-- Gráfico de Evolução Geral -->
          <v-col cols="12" class="mt-6">
            <v-divider class="mb-6"></v-divider>
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="grey-darken-3" class="mr-2">mdi-chart-line</v-icon>
              Evolução Temporal das Notas
            </h3>
            <div style="height: 350px;">
              <EvaluationLineChart :chart-data="group.chartData" />
            </div>
          </v-col>

          <!-- Gráfico de Evolução por Tópico -->
          <v-col cols="12" class="mt-6" v-if="group.topicsChartData?.datasets?.length > 0">
            <v-divider class="mb-6"></v-divider>
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="grey-darken-3" class="mr-2">mdi-chart-line-variant</v-icon>
              Evolução Temporal por Tópico
            </h3>
            <div style="height: 350px;">
              <EvaluationLineChart :chart-data="group.topicsChartData" legend-position="bottom" />
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <FormResponsesModal
      v-model="dialogFormResponses"
      :applications="selectedApplications"
    />
  </v-container>
</template>
