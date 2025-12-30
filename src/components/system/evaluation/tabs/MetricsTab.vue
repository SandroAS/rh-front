<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
import EvaluationLineChart from '@/components/system/evaluation/EvaluationLineChart.vue';
import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type';
import getApplicationTypeName from '@/utils/getApplicationTypeName.util';
import type GroupedMetric from '@/types/evaluationMetrics/grouped-metric.type';

const evaluationApplicationStore = useEvaluationApplicationStore();
const evaluationStore = useEvaluationStore();
const accountUserStore = useAccountUserStore();

const loadingData = ref(false);
const expandedCards = ref<Record<string, boolean>>({});

const today = new Date();
const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 12, today.getDate());

const dateRange = ref([
  twelveMonthsAgo.toISOString().substring(0, 10),
  today.toISOString().substring(0, 10)
]);
const datePickerMenu = ref(false);

const filters = reactive<{
  name: string | null;
  type: EvaluationType | null;
  evaluated_user_uuid: string | null;
  submitted_user_uuid: string | null;
  start_date: string | null;
  end_date: string | null;
}>({
  name: null as string | null,
  type: null as EvaluationType | null,
  evaluated_user_uuid: null as string | null,
  submitted_user_uuid: null as string | null,
  start_date: twelveMonthsAgo.toISOString().substring(0, 10),
  end_date: today.toISOString().substring(0, 10),
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

  if (!isOnMounted) {
    filters.start_date = dateRange.value[0] || null;
    filters.end_date = dateRange.value[1] || null;
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
      const topicAverages: Record<string, { sum: number, count: number, questions: any }> = {};
      const timelineMap: Record<string, Record<string, { sum: number, count: number }>> = {};
      const months: string[] = [];

      let current = new Date(filters.start_date || twelveMonthsAgo);
      const end = new Date(filters.end_date || today);
      while (current <= end) {
        const label = current.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        if (!months.includes(label)) months.push(label);
        timelineMap[label] = {};
        current.setMonth(current.getMonth() + 1);
      }

      group.applications.forEach((app: any) => {
        // Usando started_date do retorno da API
        const appDate = new Date(app.started_date);
        const monthLabel = appDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });

        // Ajuste no acesso: formResponses (plural conforme seu JSON de retorno)
        app.formResponses?.forEach((resp: any) => {
          resp.answers?.forEach((answer: any) => {
            // Tópico pode vir do formulário, se não houver, agrupamos em "Geral"
            const topic = "Geral"; 
            
            // Verificação baseada na estrutura do JSON: answer.question.type
            if (answer.question?.type === 'RATE' && answer.number_value !== null) {
              const val = parseFloat(answer.number_value);

              if (!topicAverages[topic]) {
                topicAverages[topic] = { sum: 0, count: 0, questions: {} };
              }
              topicAverages[topic].sum += val;
              topicAverages[topic].count += 1;

              const qTitle = answer.question.title;
              if (!topicAverages[topic].questions[qTitle]) {
                topicAverages[topic].questions[qTitle] = { sum: 0, count: 0 };
              }
              topicAverages[topic].questions[qTitle].sum += val;
              topicAverages[topic].questions[qTitle].count += 1;

              if (timelineMap[monthLabel]) {
                if (!timelineMap[monthLabel][topic]) {
                  timelineMap[monthLabel][topic] = { sum: 0, count: 0 };
                }
                timelineMap[monthLabel][topic].sum += val;
                timelineMap[monthLabel][topic].count += 1;
              }
            }
          });
        });
      });

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

      return {
        ...group,
        stats: topicAverages,
        chartData: { labels: months, datasets }
      };
    });

  } catch (error) {
    console.error("Erro ao carregar métricas:", error);
  } finally {
    loadingData.value = false;
  }
}

const toggleExpand = (id: string) => {
  expandedCards.value[id] = !expandedCards.value[id];
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
        <v-col cols="12" md="4">
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
        <v-col cols="12" md="2">
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
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="filters.evaluated_user_uuid"
            :items="accountUserStore.accountUsersOptions"
            item-title="name"
            item-value="uuid"
            label="Avaliado"
            variant="solo-filled"
            density="compact"
            hide-details
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="3">
          <v-menu v-model="datePickerMenu" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="dateRange.length > 1 ? `${dateRange[0]} até ${dateRange[1]}` : dateRange[0]"
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
              @update:model-value="datePickerMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
    </v-card>

    <div v-if="loadingData" class="w-100 d-flex justify-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else-if="groupedMetrics.length === 0" class="w-100 text-center py-10">
      <v-alert type="info" variant="tonal">Nenhum dado encontrado.</v-alert>
    </div>

    <div v-else class="w-100">
      <v-card 
        v-for="(group, idx) in groupedMetrics" 
        :key="idx" 
        class="mb-8"
        elevation="2"
        rounded="lg"
      >
        <v-toolbar color="secondary" dark>
          <v-toolbar-title>{{ group.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-chip color="white" size="small" class="mr-4 text-white">
            {{ group.applications.length }} Avaliações Concluídas
          </v-chip>
        </v-toolbar>

        <v-row class="pa-6">
          <!-- Coluna de Notas -->
          <v-col cols="12" lg="6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">
              <v-icon color="amber-darken-2" class="mr-2">mdi-star</v-icon>
              Desempenho por Pergunta
            </h3>
            <v-expansion-panels variant="accordion">
              <v-expansion-panel v-for="(tData, tName) in group.stats" :key="tName">
                <v-expansion-panel-title>
                  <div class="d-flex justify-space-between w-100 pr-4">
                    <span>{{ tName }}</span>
                    <v-chip size="small" color="success">
                      {{ (tData.sum / tData.count).toFixed(2) }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list density="compact">
                    <v-list-item v-for="(qData, qTitle) in tData.questions" :key="qTitle">
                      <v-list-item-title class="text-body-2">{{ qTitle }}</v-list-item-title>
                      <template v-slot:append>
                        <span class="font-weight-bold">{{ (qData.sum / qData.count).toFixed(2) }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>

          <!-- Coluna de Comentários -->
          <v-col cols="12" lg="6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">
              <v-icon color="blue" class="mr-2">mdi-message-text-outline</v-icon>
              Feedbacks Individuais
            </h3>
            <v-list lines="three" style="max-height: 400px; overflow-y: auto;">
              <template v-for="(app, aIdx) in group.applications" :key="aIdx">
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">
                    {{ app.evaluated_user?.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Tipo: {{ getApplicationTypeName(app.type) }} | De: {{ app.submitting_user?.name }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn icon="mdi-chevron-down" variant="text" @click="toggleExpand(`${idx}-${aIdx}`)"></v-btn>
                  </template>
                </v-list-item>

                <v-expand-transition>
                  <div v-if="expandedCards[`${idx}-${aIdx}`]" class="pa-4 bg-grey-lighten-4 rounded mx-4 mb-2">
                    <div v-for="resp in app.formResponses" :key="resp.uuid">
                      <div v-for="ans in resp.answers.filter(a => a.question.type !== 'RATE')" :key="ans.uuid" class="mb-2">
                        <div class="text-caption font-weight-bold">{{ ans.question.title }}</div>
                        <div class="text-body-2">{{ ans.text_value || 'Sem comentário.' }}</div>
                      </div>
                    </div>
                  </div>
                </v-expand-transition>
                <v-divider></v-divider>
              </template>
            </v-list>
          </v-col>

          <!-- Gráfico -->
          <v-col cols="12" class="mt-6">
            <v-divider class="mb-6"></v-divider>
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Evolução Temporal</h3>
            <div style="height: 300px;">
              <EvaluationLineChart :chart-data="group.chartData" />
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>
