<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useUserPanelStore } from '@/stores/user-panel.store';
import { getMetricTypeOption } from '@/types/drd/drd-metric.type';
import type { UserPanel, UserPanelDrdMetric } from '@/types/user/user-panel.type';
import type { UserMetricResponseDto } from '@/types/user/user-metric.type';
import { getUserMetricsByUserUuid } from '@/services/user-metric.service';
import UserMetricHistoryModal from './UserMetricHistoryModal.vue';

const userPanel = useUserPanelStore();

const props = defineProps<{
  user: UserPanel | null;
}>();

const emit = defineEmits<{ (e: 'saved'): void }>();

const historyModalOpen = ref(false);
const selectedMetric = ref<UserPanelDrdMetric | null>(null);
const userMetricsList = ref<UserMetricResponseDto[]>([]);
const userMetricsLoading = ref(false);

async function loadUserMetrics() {
  const uuid = props.user?.uuid;
  if (!uuid) {
    userMetricsList.value = [];
    return;
  }
  userMetricsLoading.value = true;
  try {
    userMetricsList.value = await getUserMetricsByUserUuid(uuid);
  } catch {
    userMetricsList.value = [];
  } finally {
    userMetricsLoading.value = false;
  }
}

/** Ordem do nível atual do usuário no painel (1-based). */
const currentLevelOrder = computed(() => props.user?.jobPositionCurrentLevel?.order ?? 1);

/** Retorna o min_score do nível atual do usuário para a métrica (scoresByLevel ordenado por nível). */
function getMinScoreForCurrentLevel(metric: UserPanelDrdMetric): string | null {
  const levels = metric.scoresByLevel;
  if (!levels?.length) return null;
  const index = Math.min(currentLevelOrder.value - 1, levels.length - 1);
  return levels[index]?.min_score ?? null;
}

/** Média dos valores da API para a métrica (drd_metric_uuid ou drdMetric.uuid). */
function getMetricAverage(metric: UserPanelDrdMetric): number | null {
  const metricUuid = metric.uuid;
  const items = userMetricsList.value.filter(
    (m) => m.drdMetric?.uuid === metricUuid
  );
  if (!items.length) return null;
  const sum = items.reduce((acc, m) => acc + Number(m.value), 0);
  return sum / items.length;
}

/**
 * Cor do valor da média conforme o mínimo do nível atual e o prefix da métrica.
 * - prefix ">=": maior é melhor (ex.: throughput) → ratio = average/min
 * - prefix "<=": menor é melhor (ex.: taxa de erros) → ratio = min/average
 */
function getAverageColorClass(metric: UserPanelDrdMetric): string {
  const average = getMetricAverage(metric);
  const minStr = getMinScoreForCurrentLevel(metric);
  if (average == null || minStr == null) return 'text-medium-emphasis';
  const min = parseFloat(minStr);
  if (isNaN(min) || min < 0) return 'text-medium-emphasis';
  const isLessOrEqualBetter = metric.prefix === '<=' || metric.prefix === '<=';
  let ratio: number;
  if (isLessOrEqualBetter) {
    if (average === 0) ratio = 2;
    else if (min === 0) ratio = 0;
    else ratio = min / average;
  } else {
    if (min === 0) ratio = average >= 0 ? 2 : 0;
    else ratio = average / min;
  }
  if (ratio >= 1) return 'text-green-darken-2';
  if (ratio >= 0.9) return 'text-green-lighten-1';
  if (ratio >= 0.75) return 'text-yellow-darken-2';
  if (ratio >= 0.5) return 'text-orange-darken-2';
  return 'text-red-darken-2';
}

/** Percentual (0–100) para a barra de progresso, considerando prefix (>= ou <=). */
function getMetricProgressPercent(metric: UserPanelDrdMetric): number {
  const average = getMetricAverage(metric);
  const minStr = getMinScoreForCurrentLevel(metric);
  if (average == null || minStr == null) return 0;
  const min = parseFloat(minStr);
  if (isNaN(min) || min < 0) return 0;
  const isLessOrEqualBetter = metric.prefix === '<=' || metric.prefix === '<=';
  if (isLessOrEqualBetter) {
    if (average === 0) return 100;
    if (min === 0) return 0;
    return Math.min(100, (min / average) * 100);
  }
  return Math.min(100, (average / min) * 100);
}

function openHistoryModal(metric: UserPanelDrdMetric) {
  selectedMetric.value = metric;
  historyModalOpen.value = true;
}

function onHistorySaved() {
  loadUserMetrics();
  emit('saved');
}

onMounted(() => loadUserMetrics());
watch(() => props.user?.uuid, () => loadUserMetrics());

/** Cargo completo do usuário (do plano de carreira), quando existir. */
const currentJobPosition = computed(() => {
  const currentJobUuid = props.user?.jobPosition?.uuid;
  if (!currentJobUuid) return null;
  return props.user?.careerPlan?.careerPlanJobPositions?.find(
    (item) => item.job_position_uuid === currentJobUuid || item.jobPosition?.uuid === currentJobUuid
  )?.jobPosition ?? null;
});

const currentDrd = computed(() => currentJobPosition.value?.drd);

const hasDrd = computed(() => !!currentDrd.value?.drdTopics?.length || !!currentDrd.value?.drdMetrics?.length);
</script>

<template>
  <v-card v-if="user" elevation="2" class="pa-4 overflow-hidden" style="height: 100%;">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-chart-donut</v-icon>
      Métricas de Desempenho
    </v-card-title>
    <v-divider class="mb-4" />

    <template v-if="!hasDrd">
      <div class="text-center text-medium-emphasis py-6">
        Nenhum DRD configurado para o cargo. Associe um plano de carreira ao cargo para ver métricas e médias.
      </div>
    </template>

    <template v-else>
      <!-- Métricas do DRD (como no UserCareerPlanCard) -->
      <div v-if="currentDrd?.drdMetrics?.length" class="mt-6">
        <v-row dense align="stretch">
          <v-col
            v-for="metric in currentDrd.drdMetrics"
            :key="metric.uuid"
            cols="12"
            sm="6"
            class="d-flex"
          >
            <v-card border rounded="lg" class="pa-4 transition-swing d-flex flex-column flex-grow-1">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <div class="text-caption text-disabled text-uppercase font-weight-bold" style="min-height: 40px;">{{ metric.name }}</div>
                  <div class="d-flex align-baseline flex-wrap gap-1 my-1">
                    <span
                      class="text-h4 font-weight-black"
                      :class="getAverageColorClass(metric)"
                    >
                      {{ getMetricAverage(metric) != null ? getMetricAverage(metric)!.toFixed(2) : '–' }}{{ getMetricTypeOption(metric.type)?.suffix }}
                    </span>
                    <span
                      v-if="getMinScoreForCurrentLevel(metric)"
                      class="text-caption text-disabled"
                    >
                      &nbsp;{{ (metric.prefix === '<=') ? 'máx.' : 'mín.' }} {{ getMinScoreForCurrentLevel(metric) }}{{ getMetricTypeOption(metric.type)?.suffix }}
                    </span>
                  </div>
                </div>
                <v-icon
                  :icon="getMetricTypeOption(metric.type)?.icon ?? 'mdi-chart-box'"
                  :color="getMetricTypeOption(metric.type)?.color"
                  size="large"
                />
              </div>
              <div class="flex-grow-1 mt-2">
                <v-progress-linear
                  :indeterminate="userMetricsLoading"
                  :model-value="getMetricProgressPercent(metric)"
                  height="4"
                  rounded
                  :color="getMetricTypeOption(metric.type)?.color"
                  :class="{ 'opacity-20': userMetricsLoading }"
                />
              </div>
              <div class="d-flex align-center justify-space-between mt-2">
                <span class="text-caption text-disabled">Mín. nível atual</span>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  density="compact"
                  class="text-none"
                  @click="openHistoryModal(metric)"
                >
                  <v-icon start size="small">mdi-plus</v-icon>
                  histórico
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </template>

    <UserMetricHistoryModal
      v-model="historyModalOpen"
      :user-uuid="user?.uuid ?? ''"
      :metric="selectedMetric"
      @saved="onHistorySaved"
    />
  </v-card>
</template>
