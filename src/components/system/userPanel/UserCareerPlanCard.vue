<script setup lang="ts">
import { computed, ref } from 'vue';
import type {
  UserPanel,
  UserPanelCareerPlanJobPosition,
  UserPanelDrd,
  UserPanelDrdMetric,
  UserPanelDrdTopic,
  UserPanelDrdTopicItem,
  UserPanelDrdTopicItemScore,
  UserPanelEvaluationReceived,
} from '@/types/user/user-panel.type';

const METRIC_TYPE_OPTIONS: Record<string, { title: string; icon: string; suffix?: string }> = {
  PERCENTAGE: { title: 'Pct.', icon: 'mdi-percent-outline', suffix: '%' },
  QUANTITY: { title: 'Qtd.', icon: 'mdi-tune-variant' },
  DURATION_MONTHS: { title: 'Mês', icon: 'mdi-calendar-month', suffix: 'm' },
  DURATION_WEEKS: { title: 'Sem.', icon: 'mdi-calendar-range', suffix: 'sem' },
  DURATION_DAYS: { title: 'Dia', icon: 'mdi-calendar', suffix: 'd' },
  DURATION_HOURS: { title: 'Hrs.', icon: 'mdi-clock-outline', suffix: 'h' },
  DURATION_MINUTES: { title: 'Min.', icon: 'mdi-timer-outline', suffix: 'min' },
};

const EVALUATION_TYPE_LABELS: Record<string, string> = {
  SELF: 'Autoavaliação',
  LEADER: 'Líder',
  PEER: 'Par',
};

const props = defineProps<{
  user: UserPanel | null;
}>();

/** Abas: um cargo por aba. Se não tiver plano de carreira, uma aba "Cargo atual". */
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
  const currentRef = props.user?.jobPosition;
  return [
    {
      key: 'current',
      title: currentRef?.title ?? 'Cargo atual',
      jobPosition: null,
      drd: undefined as UserPanelDrd | undefined,
      isCurrent: true,
    },
  ];
});

function isCurrentJob(item: UserPanelCareerPlanJobPosition | null): boolean {
  const currentUuid = props.user?.jobPosition?.uuid;
  if (!currentUuid || !item) return false;
  return item.job_position_uuid === currentUuid || item.jobPosition?.uuid === currentUuid;
}

const selectedTab = ref(0);
const currentTab = computed(() => tabItems.value[selectedTab.value] ?? null);

/** Nível atual do usuário (order). Usado para "próximo nível" = currentLevelOrder + 1. */
const currentLevelOrder = computed(() => props.user?.jobPositionCurrentLevel?.order ?? 0);

/** Para o cargo da aba, retorna o order do nível alvo do checklist (próximo nível no cargo atual, ou nível 1 em outros cargos). */
function getTargetLevelOrder(isCurrent: boolean): number {
  if (isCurrent) return currentLevelOrder.value + 1;
  return 1;
}

/** min_score do item para o nível alvo (próximo nível do cargo atual ou nível 1). */
function getMinScoreForTargetLevel(
  item: UserPanelDrdTopicItem,
  targetLevelOrder: number
): number | null {
  const entry = item.scoresByLevel?.find(
    (s: UserPanelDrdTopicItemScore) => s.drd_level_order === targetLevelOrder
  );
  if (!entry?.min_score) return null;
  const n = parseFloat(String(entry.min_score));
  return isNaN(n) ? null : n;
}

/** Última avaliação por tipo (SELF, LEADER, PEER) finalizada. */
const latestEvaluationsByType = computed(() => {
  const list = (props.user?.evaluationsReceived ?? []).filter(
    (e) => e.status === 'FINISHED' && e.finished_at
  ) as UserPanelEvaluationReceived[];
  const byType = new Map<string, UserPanelEvaluationReceived>();
  const sorted = [...list].sort(
    (a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime()
  );
  for (const ev of sorted) {
    if (ev.type && !byType.has(ev.type)) byType.set(ev.type, ev);
  }
  return byType;
});

/** Média das notas das últimas avaliações por tipo para um item (por drd_topic_item_uuid ou por título da pergunta). */
function getAverageScoreForItem(
  item: UserPanelDrdTopicItem,
  _topic: UserPanelDrdTopic
): { average: number; byType: Record<string, number> } {
  const byType: Record<string, number> = {};
  const itemUuid = item.uuid;
  const itemNameNorm = item.name?.toLowerCase().replace(/\s+/g, ' ').trim() ?? '';

  for (const [type, ev] of latestEvaluationsByType.value) {
    const response = ev.responses?.find((r) => r.is_completed && r.answers?.length);
    let score: number | null = null;
    for (const answer of response?.answers ?? []) {
      const numVal = parseFloat(answer.number_value ?? '');
      if (isNaN(numVal)) continue;
      const topic = answer.question?.applicationTopic;
      const questionItemUuid = topic?.drd_topic_item_uuid;
      const questionTitleNorm = answer.question?.title?.toLowerCase().replace(/\s+/g, ' ').trim() ?? '';
      if (questionItemUuid === itemUuid || questionTitleNorm === itemNameNorm) {
        if (score === null || numVal > score) score = numVal;
      }
    }
    if (score !== null) byType[type] = score;
  }

  const values = Object.values(byType);
  const average =
    values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
  return { average, byType };
}

/** Rate máximo do DRD (escala 1–5 normalmente). */
function getDrdRate(drd: UserPanelDrd | undefined): number {
  return drd?.rate ?? 5;
}

/** Totalizador por métrica: valor atual não vem no painel; exibimos placeholder. Formatação por tipo. */
function formatMetricValue(metric: UserPanelDrdMetric, value: number | null): string {
  if (value === null || value === undefined) return '–';
  const opt = METRIC_TYPE_OPTIONS[metric.type];
  const suffix = opt?.suffix ?? '';
  if (metric.type === 'PERCENTAGE') return `${Math.round(value)}%`;
  if (metric.type === 'QUANTITY') return String(Math.round(value));
  return `${value} ${suffix}`.trim();
}

/** Valor atual da métrica: não existe no UserPanel; placeholder 0 ou valor futuro da API. */
function getMetricCurrentValue(_metric: UserPanelDrdMetric): number | null {
  return null;
}

const hasAnyDrd = computed(() =>
  tabItems.value.some((t) => t.drd?.drdTopics?.length || t.drd?.drdMetrics?.length)
);
</script>

<template>
  <v-card v-if="user" elevation="2" class="pa-4">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-chart-bar</v-icon>
      Desempenho e requisitos para o próximo nível
    </v-card-title>
    <v-divider class="mb-4" />

    <template v-if="!hasAnyDrd">
      <v-alert type="info" variant="tonal" density="compact" class="mb-0">
        Não há dados de DRD disponíveis para exibir métricas e checklist. Associe um plano de
        carreira ao cargo ou configure o DRD do cargo.
      </v-alert>
    </template>

    <template v-else>
      <v-tabs v-model="selectedTab" density="compact" class="mb-4" show-arrows>
        <v-tab v-for="(tab, idx) in tabItems" :key="tab.key" :value="idx">
          {{ tab.title }}
          <v-icon v-if="tab.isCurrent" size="small" class="ml-1" color="primary"
            >mdi-account-star</v-icon
          >
        </v-tab>
      </v-tabs>

      <v-window v-model="selectedTab" class="transparent">
        <v-window-item v-for="(tab, idx) in tabItems" :key="tab.key" :value="idx">
          <div v-if="!tab.drd" class="text-medium-emphasis py-4">
            DRD não disponível para este cargo.
          </div>

          <template v-else>
            <!-- Totalizadores por métrica -->
            <div v-if="tab.drd.drdMetrics?.length" class="mb-6">
              <div class="text-subtitle-1 font-weight-bold mb-3">Métricas de desempenho</div>
              <v-row dense>
                <v-col
                  v-for="metric in tab.drd.drdMetrics"
                  :key="metric.uuid"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card variant="outlined" class="pa-3" rounded="lg">
                    <div class="d-flex align-center mb-1">
                      <v-icon size="small" class="mr-2" :icon="METRIC_TYPE_OPTIONS[metric.type]?.icon ?? 'mdi-chart-box'" />
                      <span class="text-body2 text-medium-emphasis">{{ metric.name }}</span>
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ formatMetricValue(metric, getMetricCurrentValue(metric)) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ metric.prefix }}
                      {{ (metric.scoresByLevel as { min_score?: string }[])?.[0]?.min_score ?? '–' }}
                      (mín. nível alvo)
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Checklist por tópico / item -->
            <div v-if="tab.drd.drdTopics?.length">
              <div class="text-subtitle-1 font-weight-bold mb-3">Requisitos por avaliação</div>
              <p class="text-caption text-medium-emphasis mb-3">
                Média das últimas avaliações (por tipo) em cada item. Completo quando a média
                &ge; nota mínima do nível alvo.
              </p>

              <div
                v-for="topic in tab.drd.drdTopics"
                :key="topic.uuid"
                class="mb-6"
              >
                <v-list-subheader class="font-weight-bold text-subtitle-2 px-0">
                  {{ topic.name }}
                </v-list-subheader>
                <v-list density="compact" class="pt-2">
                  <v-list-item
                    v-for="item in topic.drdTopicItems"
                    :key="item.uuid"
                    class="align-start"
                  >
                    <template #prepend>
                      <v-icon
                        :color="
                          getAverageScoreForItem(item, topic).average >=
                          (getMinScoreForTargetLevel(
                            item,
                            getTargetLevelOrder(tab.isCurrent)
                          ) ?? 0)
                            ? 'success'
                            : 'grey-lighten-1'
                        "
                        :icon="
                          getAverageScoreForItem(item, topic).average >=
                          (getMinScoreForTargetLevel(
                            item,
                            getTargetLevelOrder(tab.isCurrent)
                          ) ?? 0)
                            ? 'mdi-check-circle'
                            : 'mdi-circle-outline'
                        "
                        class="mt-1"
                      />
                    </template>
                    <v-list-item-title class="text-wrap mb-2">{{ item.name }}</v-list-item-title>
                    <div class="d-flex align-center flex-wrap gap-2 mb-1">
                      <v-slider
                        :model-value="getAverageScoreForItem(item, topic).average"
                        :min="0"
                        :max="getDrdRate(tab.drd)"
                        :step="0.1"
                        thumb-label="always"
                        density="compact"
                        hide-details
                        class="mt-0 flex-grow-1"
                        style="max-width: 280px;"
                        readonly
                        color="primary"
                      />
                      <span class="text-caption text-medium-emphasis">
                        Média: {{ getAverageScoreForItem(item, topic).average.toFixed(1) }} /
                        {{ getDrdRate(tab.drd) }}
                        <template v-if="getMinScoreForTargetLevel(item, getTargetLevelOrder(tab.isCurrent)) != null">
                          (mín. {{ getMinScoreForTargetLevel(item, getTargetLevelOrder(tab.isCurrent)) }})
                        </template>
                      </span>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mt-1">
                      <v-chip
                        v-for="(score, type) in getAverageScoreForItem(item, topic).byType"
                        :key="type"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ EVALUATION_TYPE_LABELS[type] ?? type }}: {{ score.toFixed(1) }}
                      </v-chip>
                    </div>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </template>
        </v-window-item>
      </v-window>
    </template>
  </v-card>
</template>
