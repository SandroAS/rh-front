<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
import EvaluationLineChart from '@/components/system/evaluation/EvaluationLineChart.vue';
import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type';

const evaluationApplicationStore = useEvaluationApplicationStore();
const evaluationStore = useEvaluationStore();
const accountUserStore = useAccountUserStore();

const loadingData = ref(false);
const expandedCards = ref<Record<string, boolean>>({});

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
  start_date: null,
  end_date: null,
});

// Período padrão: Últimos 12 meses
const today = new Date();
const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 12, today.getDate());

// Inicializa o range de datas
const dateRange = ref([
  twelveMonthsAgo.toISOString().substring(0, 10),
  today.toISOString().substring(0, 10)
]);
const datePickerMenu = ref(false);

const applicationTypeOptions = [
  { title: 'Autoavaliação', value: EvaluationType.SELF },
  { title: 'Avaliação por Pares', value: EvaluationType.PEER },
  { title: 'Avaliação por Líder', value: EvaluationType.LEADER },
  { title: 'Avaliação por Liderado', value: EvaluationType.SUBORDINATE },
];

const groupedMetrics = ref<any[]>([]);

const loadMetricsData = async () => {
  loadingData.value = true;

  filters.start_date = dateRange.value[0] || null;
  filters.end_date = dateRange.value[1] || null;

  try {
    const {name, type, evaluated_user_uuid, submitted_user_uuid, start_date, end_date} = filters;
    await evaluationApplicationStore.getEvaluationApplicationsFilterMetrics(name, type, evaluated_user_uuid, submitted_user_uuid, start_date, end_date);

    const allApplications = evaluationApplicationStore.evaluation_applications || [];

    const groups: Record<string, any> = {};

    allApplications.forEach(app => {
      const evaluationName = app.evaluation?.name || app.evaluation_uuid || "Sem Nome";
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

    // Processamento de Estatísticas e Gráfico
    groupedMetrics.value = Object.values(groups).map(group => {
      const topicAverages: Record<string, { sum: number, count: number, questions: any }> = {};
      const timelineMap: Record<string, Record<string, { sum: number, count: number }>> = {};
      const months: string[] = [];

      // Gerar labels dos meses baseados no período selecionado
      let current = new Date(filters.start_date || twelveMonthsAgo);
      const end = new Date(filters.end_date || today);
      while (current <= end) {
        const label = current.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        months.push(label);
        timelineMap[label] = {};
        current.setMonth(current.getMonth() + 1);
      }

      group.applications.forEach((app: any) => {
        // Usamos created_at conforme definido no backend
        const appDate = new Date(app.created_at);
        const monthLabel = appDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });

        app.form_responses?.forEach((resp: any) => {
          resp.answers?.forEach((answer: any) => {
            const topic = answer.topic_title || 'Geral';
            
            if (answer.question_type === 'RATE' && typeof answer.number_value === 'number') {
              if (!topicAverages[topic]) {
                topicAverages[topic] = { sum: 0, count: 0, questions: {} };
              }
              topicAverages[topic].sum += answer.number_value;
              topicAverages[topic].count += 1;

              const qTitle = answer.question_title;
              if (!topicAverages[topic].questions[qTitle]) {
                topicAverages[topic].questions[qTitle] = { sum: 0, count: 0 };
              }
              topicAverages[topic].questions[qTitle].sum += answer.number_value;
              topicAverages[topic].questions[qTitle].count += 1;

              if (timelineMap[monthLabel]) {
                if (!timelineMap[monthLabel][topic]) {
                  timelineMap[monthLabel][topic] = { sum: 0, count: 0 };
                }
                timelineMap[monthLabel][topic].sum += answer.number_value;
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
          data: months.map(m => {
            const data = timelineMap[m] ? timelineMap[m][topic] : null;
            return data ? parseFloat((data.sum / data.count).toFixed(2)) : null;
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
};

const toggleExpand = (id: string) => {
  expandedCards.value[id] = !expandedCards.value[id];
};

// Debounce simples para não sobrecarregar a API enquanto digita o nome
let debounceTimer: any;
watch(() => [filters, dateRange.value], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadMetricsData();
  }, 500);
}, { deep: true });

onMounted(async () => {
  await Promise.all([
    evaluationStore.getAllEvaluations(),
    accountUserStore.getAllAccountUsers()
  ]);
  loadMetricsData();
});
</script>

<template>
  <v-container fluid class="bg-grey-lighten-4 fill-height align-start">
    <!-- Filtros Superiores -->
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

    <!-- Lista de Agrupamentos -->
    <div v-if="loadingData" class="w-100 d-flex justify-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else-if="groupedMetrics.length === 0" class="w-100 text-center py-10">
      <v-alert type="info" variant="tonal" icon="mdi-information">
        Nenhum dado encontrado para os filtros aplicados.
      </v-alert>
    </div>

    <div v-else class="w-100 space-y-6">
      <v-card 
        v-for="(group, idx) in groupedMetrics" 
        :key="idx" 
        class="mb-8 overflow-hidden"
        elevation="2"
        rounded="lg"
      >
        <v-toolbar color="grey-darken-4" dark>
          <v-toolbar-title class="font-weight-bold">{{ group.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-chip color="blue-lighten-4" size="small" class="mr-4 text-black">
            {{ group.applications.length }} Respostas
          </v-chip>
        </v-toolbar>

        <v-row class="pa-6">
          <v-col cols="12" lg="6">
            <h3 class="text-h6 mb-4 d-flex align-center">
              <v-icon color="amber-darken-2" class="mr-2">mdi-star</v-icon>
              Médias por Tópico
            </h3>
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                v-for="(tData, tName) in group.stats"
                :key="tName"
              >
                <v-expansion-panel-title>
                  <div class="d-flex justify-space-between w-100 pr-4">
                    <span class="font-weight-medium">{{ tName }}</span>
                    <v-chip size="small" color="primary" variant="flat">
                      {{ (tData.sum / tData.count).toFixed(2) }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list density="compact">
                    <v-list-item
                      v-for="(qData, qTitle) in tData.questions"
                      :key="qTitle"
                    >
                      <template v-slot:append>
                        <span class="font-weight-bold text-blue">{{ (qData.sum / qData.count).toFixed(2) }}</span>
                      </template>
                      <v-list-item-title class="text-body-2">{{ qTitle }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>

          <v-col cols="12" lg="6">
            <h3 class="text-h6 mb-4 d-flex align-center">
              <v-icon color="blue" class="mr-2">mdi-text-box-outline</v-icon>
              Respostas Qualitativas
            </h3>
            <div style="max-height: 450px; overflow-y: auto;">
              <v-list lines="two">
                <template v-for="(app, aIdx) in group.applications" :key="aIdx">
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold text-subtitle-2">
                      Avaliado: {{ app.evaluatedUser?.name || 'Não identificado' }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      Submetido por: {{ app.submittingUser?.name || 'Sistema' }} em {{ new Date(app.created_at).toLocaleDateString() }}
                    </v-list-item-subtitle>
                    <template v-slot:append>
                      <v-btn
                        variant="text"
                        icon="mdi-eye-outline"
                        @click="toggleExpand(`${idx}-${aIdx}`)"
                      ></v-btn>
                    </template>
                  </v-list-item>
                  
                  <v-expand-transition>
                    <div v-if="expandedCards[`${idx}-${aIdx}`]" class="px-4 py-2 bg-grey-lighten-5 rounded mb-2">
                      <div v-for="(resp, rIdx) in app.form_responses" :key="rIdx">
                        <div v-for="(ans, ansIdx) in resp.answers?.filter((a: any) => a.question_type !== 'RATE')" :key="ansIdx" class="mb-3">
                          <p class="text-caption font-weight-bold text-grey-darken-1 mb-1">{{ ans.question_title }}</p>
                          <p class="text-body-2 border-left pl-3">{{ ans.text_value || 'Nenhuma observação.' }}</p>
                        </div>
                      </div>
                    </div>
                  </v-expand-transition>
                  <v-divider></v-divider>
                </template>
              </v-list>
            </div>
          </v-col>

          <v-col cols="12" class="mt-4">
            <v-divider class="mb-6"></v-divider>
            <h3 class="text-h6 mb-4 d-flex align-center">
              <v-icon color="purple" class="mr-2">mdi-chart-line</v-icon>
              Evolução das Médias
            </h3>
            <div style="height: 300px;">
              <EvaluationLineChart :chart-data="group.chartData" />
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
.border-left {
  border-left: 3px solid #e0e0e0;
}
.space-y-6 > * + * {
  margin-top: 1.5rem;
}
</style>