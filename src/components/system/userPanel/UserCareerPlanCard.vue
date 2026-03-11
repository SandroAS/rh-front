<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { getMetricTypeOption } from '@/types/drd/drd-metric.type';
import type {
  UserPanel,
  UserPanelCareerPlanJobPosition,
  UserPanelDrd,
  UserPanelDrdMetric,
  UserPanelDrdTopicItem,
  UserPanelEvaluationReceived,
} from '@/types/user/user-panel.type';
import type { UserMetricResponseDto } from '@/types/user/user-metric.type';
import { getUserMetricsByUserUuid } from '@/services/user-metric.service';

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

const EVALUATION_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  SELF: { label: 'Auto', color: 'indigo' },
  LEADER: { label: 'Líder', color: 'amber-darken-2' },
  PEER: { label: 'Par', color: 'green' },
};

const props = defineProps<{
  user: UserPanel | null;
}>();

const selectedTab = ref(0);

/** Mapeamento de abas com tratamento de dados */
const tabItems = computed(() => {
  const plan = props.user?.careerPlan?.careerPlanJobPositions;
  if (plan?.length) {
    return plan.map((item) => ({
      key: item.uuid,
      title: item.jobPosition?.title ?? 'Cargo',
      jobPosition: item,
      drd: item.jobPosition?.drd,
      isCurrent: isCurrentJob(item),
    }));
  }
  return [{
    key: 'current',
    title: props.user?.jobPosition?.title ?? 'Cargo atual',
    jobPosition: null,
    drd: props.user?.jobPosition?.drd as UserPanelDrd | undefined,
    isCurrent: true,
  }];
});

function isCurrentJob(item: UserPanelCareerPlanJobPosition | null): boolean {
  const currentUuid = props.user?.jobPosition?.uuid;
  if (!currentUuid || !item) return false;
  return item.job_position_uuid === currentUuid || item.jobPosition?.uuid === currentUuid;
}

const currentLevelOrder = computed(() => props.user?.jobPositionCurrentLevel?.order ?? 0);

/** Ordem do nível atual (1-based) para índices de métricas. */
const currentLevelOrderForMetrics = computed(() => props.user?.jobPositionCurrentLevel?.order ?? 1);

/** Min/max do nível atual para a métrica (scoresByLevel ordenado por nível). */
function getMinScoreForCurrentLevel(metric: UserPanelDrdMetric): string | null {
  const levels = metric.scoresByLevel;
  if (!levels?.length) return null;
  const index = Math.min(currentLevelOrderForMetrics.value - 1, levels.length - 1);
  return levels[index]?.min_score ?? null;
}

/** Média dos valores da API para a métrica. */
function getMetricAverage(metric: UserPanelDrdMetric): number | null {
  const metricUuid = metric.uuid;
  const items = userMetricsList.value.filter((m) => m.drdMetric?.uuid === metricUuid);
  if (!items.length) return null;
  const sum = items.reduce((acc, m) => acc + Number(m.value), 0);
  return sum / items.length;
}

/** Cor do valor da média conforme o mínimo do nível e o prefix da métrica. */
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

/** Percentual (0–100) para a barra de progresso. */
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

/** True se a média já atingiu a meta do nível atual (checklist). */
function hasReachedCurrentLevelMin(metric: UserPanelDrdMetric): boolean {
  const average = getMetricAverage(metric);
  const currentMinStr = getMinScoreForCurrentLevel(metric);
  if (average == null || currentMinStr == null) return false;
  const currentMin = parseFloat(currentMinStr);
  if (isNaN(currentMin)) return false;
  const isLessOrEqualBetter = metric.prefix === '<=' || metric.prefix === '<=';
  if (isLessOrEqualBetter) return average <= currentMin;
  return average >= currentMin;
}

function getTargetLevel(drd: UserPanelDrd | undefined, isCurrent: boolean) {
  const targetOrder = isCurrent ? currentLevelOrder.value + 1 : 1;
  return drd?.drdLevels?.find(l => l.order === targetOrder) || drd?.drdLevels?.[0];
}

function getMinScore(item: UserPanelDrdTopicItem, targetLevelOrder: number): number | null {
  const entry = item.scoresByLevel?.find(s => s.drd_level_order === targetLevelOrder);
  return entry?.min_score ? parseFloat(String(entry.min_score)) : null;
}

/** Conjunto de UUIDs dos itens de tópico do DRD da aba. */
function getTabDrdItemUuids(tab: { drd?: UserPanelDrd }): Set<string> {
  const uuids = new Set<string>();
  for (const topic of tab.drd?.drdTopics ?? []) {
    for (const item of topic.drdTopicItems ?? []) {
      if (item.uuid) uuids.add(item.uuid);
    }
  }
  return uuids;
}

/** Avaliações concluídas filtradas por cargo da aba: por nome (contém título do cargo) ou por respostas que referenciam itens do DRD da aba. */
function getLatestEvaluationsByTypeForTab(tab: { title: string; drd?: UserPanelDrd }): Map<string, UserPanelEvaluationReceived> {
  const list = (props.user?.evaluationsReceived ?? []).filter(e => e.status === 'FINISHED' && e.finished_at);
  const titleLower = tab.title?.toLowerCase().trim() ?? '';
  let forThisPosition = titleLower
    ? list.filter(e => e.name?.toLowerCase().includes(titleLower))
    : list;
  if (forThisPosition.length === 0 && tab.drd) {
    const itemUuids = getTabDrdItemUuids(tab);
    forThisPosition = list.filter(ev => {
      const response = ev.responses?.find(r => r.is_completed && r.answers?.length);
      return response?.answers?.some(a =>
        itemUuids.has((a.question?.applicationTopic as { drd_topic_item_uuid?: string } | undefined)?.drd_topic_item_uuid ?? '')
      ) ?? false;
    });
  }
  const byType = new Map<string, UserPanelEvaluationReceived>();
  const sorted = [...forThisPosition].sort((a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime());
  for (const ev of sorted) {
    if (ev.type && !byType.has(ev.type)) byType.set(ev.type, ev);
  }
  return byType;
}

function getPerformance(
  item: UserPanelDrdTopicItem,
  tab: { title: string; drd?: UserPanelDrd }
): { average: number; byType: Record<string, number> } {
  const byType: Record<string, number> = {};
  const itemUuid = item.uuid;
  const itemNameNorm = item.name?.toLowerCase().trim();
  const latestForTab = getLatestEvaluationsByTypeForTab(tab);

  for (const [type, ev] of latestForTab) {
    const response = ev.responses?.find((r) => r.is_completed);
    let score: number | null = null;
    for (const answer of response?.answers ?? []) {
      const numVal = parseFloat(answer.number_value ?? '');
      if (isNaN(numVal)) continue;
      const qUuid = answer.question?.applicationTopic?.drd_topic_item_uuid;
      const qTitle = answer.question?.title?.toLowerCase().trim();
      if (qUuid === itemUuid || qTitle === itemNameNorm) {
        if (score === null || numVal > score) score = numVal;
      }
    }
    if (score !== null) byType[type] = score;
  }

  const values = Object.values(byType);
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return { average, byType };
}

function getProgressColor(current: number, target: number | null) {
  if (target === null) return 'grey';
  const ratio = current / target;
  if (ratio >= 1) return 'success';
  if (ratio >= 0.7) return 'warning';
  return 'error';
}

const hasAnyDrd = computed(() => tabItems.value.some((t) => t.drd?.drdTopics?.length || t.drd?.drdMetrics?.length));

onMounted(() => loadUserMetrics());
watch(() => props.user?.uuid, () => loadUserMetrics());
</script>

<template>
  <v-card v-if="user" elevation="2" class="overflow-hidden">
    <!-- Header Minimalista -->
    <v-toolbar color="white" flat border="bottom">
      <v-toolbar-title class="text-subtitle-1 font-weight-black d-flex align-center">
        <v-icon start color="primary" icon="mdi-shield-check-outline" />
        REQUISITOS DE EVOLUÇÃO
      </v-toolbar-title>
      <v-spacer />
      <v-chip size="small" variant="flat" color="grey-lighten-4" class="mr-4">
        Nível Atual:&nbsp;<b>{{ user.jobPositionCurrentLevel?.name || 'Iniciante' }}</b>
      </v-chip>
    </v-toolbar>

    <v-card-text class="pa-0">
      <template v-if="!hasAnyDrd">
        <div class="pa-12 text-center">
          <v-icon size="64" color="grey-lighten-2" icon="mdi-file-search-outline" class="mb-4" />
          <h3 class="text-h6 text-medium-emphasis">Nenhum requisito configurado</h3>
          <p class="text-body-2 text-disabled">Configure o DRD ou plano de carreira para visualizar o progresso.</p>
        </div>
      </template>

      <template v-else>
        <!-- Tabs Customizadas -->
        <v-tabs v-model="selectedTab" color="primary" align-tabs="start" class="px-4 pt-2">
          <v-tab v-for="(tab, idx) in tabItems" :key="tab.key" :value="idx" class="text-none">
            <v-icon v-if="tab.isCurrent" start icon="mdi-star" size="small" />
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <v-window v-model="selectedTab">
          <v-window-item v-for="(tab, idx) in tabItems" :key="tab.key" :value="idx">
            <div class="pa-6">
              <div v-if="!tab.drd" class="py-12 text-center text-disabled">
                Sem dados de desempenho para este cargo.
              </div>

              <template v-else>
                <!-- Seção: Métricas (Cards Estilizados) -->
                <div v-if="tab.drd.drdMetrics?.length" class="mb-8">
                  <div class="d-flex align-center mb-4">
                    <h4 class="text-overline font-weight-bold" style="min-width: fit-content;">
                      Métricas de Performance
                    </h4>
                    <v-divider class="ml-4" />
                  </div>
                  <v-row dense align="stretch">
                    <v-col v-for="metric in tab.drd.drdMetrics" :key="metric.uuid" cols="12" sm="6" md="4" class="d-flex">
                      <v-hover v-slot="{ isHovering, props: hoverProps }">
                        <div class="d-flex flex-grow-1">
                          <v-card
                            v-bind="hoverProps"
                            :elevation="isHovering ? 4 : 0"
                            border
                            rounded="lg"
                            class="pa-4 transition-swing d-flex flex-column flex-grow-1"
                          >
                            <div class="d-flex justify-space-between align-start">
                              <div class="d-flex align-start flex-grow-1 min-width-0">
                                <v-icon
                                  v-if="tab.isCurrent"
                                  :icon="hasReachedCurrentLevelMin(metric) ? 'mdi-check-decagram' : 'mdi-circle-outline'"
                                  :color="hasReachedCurrentLevelMin(metric) ? 'success' : 'grey-lighten-1'"
                                  size="small"
                                  class="mr-2 mt-1 flex-shrink-0"
                                />
                                <div class="min-width-0">
                                  <div class="text-caption text-disabled text-uppercase font-weight-bold" style="min-height: 40px;">{{ metric.name }}</div>
                                <div class="d-flex align-baseline flex-wrap gap-1 my-1">
                                  <span
                                    class="text-h4 font-weight-black"
                                    :class="tab.isCurrent ? getAverageColorClass(metric) : 'text-medium-emphasis'"
                                  >
                                    {{ (tab.isCurrent && getMetricAverage(metric) != null) ? getMetricAverage(metric)!.toFixed(2) : '–' }}{{ getMetricTypeOption(metric.type)?.suffix }}
                                  </span>
                                  <span
                                    v-if="getMinScoreForCurrentLevel(metric)"
                                    class="text-caption text-disabled"
                                  >
                                    &nbsp;{{ (metric.prefix === '<=') ? 'máx.' : 'mín.' }} {{ getMinScoreForCurrentLevel(metric) }}{{ getMetricTypeOption(metric.type)?.suffix }}
                                  </span>
                                </div>
                                </div>
                              </div>
                              <v-icon
                                :icon="getMetricTypeOption(metric.type)?.icon ?? 'mdi-chart-box'"
                                :color="getMetricTypeOption(metric.type)?.color"
                                size="large"
                                class="opacity-60"
                              />
                            </div>
                            <div class="flex-grow-1 mt-2">
                              <v-progress-linear
                                :indeterminate="userMetricsLoading"
                                :model-value="tab.isCurrent ? getMetricProgressPercent(metric) : 0"
                                height="4"
                                rounded
                                :color="getMetricTypeOption(metric.type)?.color"
                                :class="{ 'opacity-20': userMetricsLoading }"
                              />
                            </div>
                            <div class="text-caption mt-2 text-disabled">Manter {{ (metric.prefix === '<=') ? 'menor ou igual' : 'maior ou igual' }} a {{ getMinScoreForCurrentLevel(metric) }}{{ getMetricTypeOption(metric.type)?.suffix }} para o nível atual</div>
                          </v-card>
                        </div>
                      </v-hover>
                    </v-col>
                  </v-row>
                </div>

                <!-- Seção: Checklist de Tópicos -->
                <div v-if="tab.drd.drdTopics?.length">
                  <div class="d-flex align-center mb-4">
                    <h4 class="text-overline font-weight-bold" style="min-width: fit-content;">
                      Competências Avaliadas
                    </h4>
                    <v-divider class="ml-4" />
                  </div>

                  <div v-for="topic in tab.drd.drdTopics" :key="topic.uuid" class="mb-8">
                    <div class="d-flex align-center mb-4">
                      <v-icon size="small" icon="mdi-folder-outline" class="mr-2" color="primary" />
                      <span class="text-subtitle-2 font-weight-black">{{ topic.name }}</span>
                    </div>

                    <v-list class="pa-0 bg-transparent rounded-lg border overflow-hidden">
                      <v-list-item
                        v-for="item in topic.drdTopicItems"
                        :key="item.uuid"
                        class="px-4 py-4 border-bottom-light"
                      >
                        <v-row align="center" no-gutters>
                          <v-col cols="12" md="5" class="pr-md-4 mb-2 mb-md-0">
                            <div class="d-flex align-center">
                              <v-icon
                                :icon="getPerformance(item, tab).average >= (getMinScore(item, getTargetLevel(tab.drd, tab.isCurrent)?.order || 0) ?? 0) ? 'mdi-check-decagram' : 'mdi-circle-outline'"
                                :color="getPerformance(item, tab).average >= (getMinScore(item, getTargetLevel(tab.drd, tab.isCurrent)?.order || 0) ?? 0) ? 'success' : 'grey-lighten-1'"
                                class="mr-3"
                              />
                              <span class="text-body-2 font-weight-medium">{{ item.name }}</span>
                            </div>
                          </v-col>

                          <v-col cols="12" md="7">
                            <div class="d-flex align-center gap-4">
                              <div class="flex-grow-1">
                                <div class="d-flex justify-space-between text-caption mb-1">
                                  <span class="text-medium-emphasis">Sua Média: <b>{{ getPerformance(item, tab).average.toFixed(1) }}</b></span>
                                  <span v-if="getMinScore(item, getTargetLevel(tab.drd, tab.isCurrent)?.order || 0)" class="font-weight-bold">
                                    Meta: {{ getMinScore(item, getTargetLevel(tab.drd, tab.isCurrent)?.order || 0) }}
                                  </span>
                                </div>
                                <v-progress-linear
                                  :model-value="(getPerformance(item, tab).average / (tab.drd?.rate || 5)) * 100"
                                  height="10"
                                  rounded
                                  :color="getProgressColor(getPerformance(item, tab).average, getMinScore(item, getTargetLevel(tab.drd, tab.isCurrent)?.order || 0))"
                                >
                                  <template #default="{ value }">
                                    <div class="target-marker" :style="{ left: `${( (getMinScore(item, getTargetLevel(tab.drd, tab.isCurrent)?.order || 0) ?? 0) / (tab.drd?.rate || 5) ) * 100}%` }"></div>
                                  </template>
                                </v-progress-linear>
                              </div>

                              <!-- Chips de Fontes -->
                              <div class="d-none d-sm-flex gap-1 ml-4" style="min-width: 140px; justify-content: flex-end;">
                                <v-tooltip v-for="(score, type) in getPerformance(item, tab).byType" :key="type" location="top">
                                  <template #activator="{ props }">
                                    <v-chip
                                      v-bind="props"
                                      size="x-small"
                                      variant="flat"
                                      :color="EVALUATION_TYPE_CONFIG[type]?.color || 'grey'"
                                      class="font-weight-bold"
                                    >
                                      {{ EVALUATION_TYPE_CONFIG[type]?.label[0] }}
                                    </v-chip>
                                  </template>
                                  {{ EVALUATION_TYPE_CONFIG[type]?.label }}: {{ score.toFixed(1) }}
                                </v-tooltip>
                              </div>
                            </div>
                          </v-col>
                        </v-row>
                      </v-list-item>
                    </v-list>
                  </div>
                </div>
              </template>
            </div>
          </v-window-item>
        </v-window>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

.border-bottom-light {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-light:last-child {
  border-bottom: none;
}

.transition-swing {
  transition: all 0.2s ease-in-out;
}

/* Marcador de meta na barra de progresso */
.target-marker {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 3px;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
  border-radius: 2px;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

:deep(.v-window__container) {
  height: auto !important;
}

/* Estilização das abas */
:deep(.v-tab) {
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-weight: 600;
}
</style>
