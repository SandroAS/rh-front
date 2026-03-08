<script setup lang="ts">
import { computed } from 'vue';
import { useUserPanelStore } from '@/stores/user-panel.store';
import { getMetricTypeOption } from '@/types/drd/drd-metric.type';
import type {
  UserPanel,
  UserPanelDrd,
  UserPanelDrdTopicItem,
  UserPanelEvaluationReceived,
} from '@/types/user/user-panel.type';
import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type';

const userPanel = useUserPanelStore();

const EVALUATION_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  [EvaluationType.SELF]: { label: 'Autoavaliação', color: 'indigo' },
  [EvaluationType.LEADER]: { label: 'Líder', color: 'amber-darken-2' },
  [EvaluationType.PEER]: { label: 'Par', color: 'green' },
};

const props = defineProps<{
  user: UserPanel | null;
}>();

/** Cargo completo do usuário (do plano de carreira), quando existir. */
const currentJobPosition = computed(() => {
  const currentJobUuid = props.user?.jobPosition?.uuid;
  if (!currentJobUuid) return null;
  return props.user?.careerPlan?.careerPlanJobPositions?.find(
    (item) => item.job_position_uuid === currentJobUuid || item.jobPosition?.uuid === currentJobUuid
  )?.jobPosition ?? null;
});

const currentDrd = computed(() => currentJobPosition.value?.drd);
const drdRate = computed(() => currentDrd.value?.rate ?? 5);

/** Aba fictícia do cargo atual para reutilizar lógica de filtro de avaliações. */
const currentTab = computed(() => ({
  title: props.user?.jobPosition?.title ?? '',
  drd: currentDrd.value,
}));

function getTabDrdItemUuids(drd: UserPanelDrd | undefined): Set<string> {
  const uuids = new Set<string>();
  for (const topic of drd?.drdTopics ?? []) {
    for (const item of topic.drdTopicItems ?? []) {
      if (item.uuid) uuids.add(item.uuid);
    }
  }
  return uuids;
}

/** Avaliações concluídas do cargo atual (por nome ou por respostas que referenciam itens do DRD). */
const latestEvaluationsByType = computed(() => {
  const list = (props.user?.evaluationsReceived ?? []).filter(e => e.status === 'FINISHED' && e.finished_at);
  const tab = currentTab.value;
  const titleLower = tab.title?.toLowerCase().trim() ?? '';
  let forThisPosition = titleLower
    ? list.filter(e => e.name?.toLowerCase().includes(titleLower))
    : list;
  if (forThisPosition.length === 0 && tab.drd) {
    const itemUuids = getTabDrdItemUuids(tab.drd);
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
});

/** Para um item do DRD, retorna a nota por tipo (última avaliação de cada tipo) e a média geral do item. */
function getItemScores(item: UserPanelDrdTopicItem): { byType: Record<string, number>; average: number } {
  const byType: Record<string, number> = {};
  const itemUuid = item.uuid;
  const itemNameNorm = item.name?.toLowerCase().trim();
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

  for (const [type, ev] of latestEvaluationsByType.value) {
    const response = ev.responses?.find(r => r.is_completed);
    let score: number | null = null;
    for (const answer of response?.answers ?? []) {
      const numVal = parseFloat(answer.number_value ?? '');
      if (isNaN(numVal)) continue;
      const qUuid = (answer.question?.applicationTopic as { drd_topic_item_uuid?: string } | undefined)?.drd_topic_item_uuid;
      const qTitle = answer.question?.title?.trim();
      const matchByUuid = itemUuid && qUuid === itemUuid;
      const matchByTitle = qTitle && normalize(qTitle) === itemNameNorm;
      if (matchByUuid || matchByTitle) {
        if (score === null || numVal > score) score = numVal;
      }
    }
    if (score !== null) byType[type] = score;
  }
  const values = Object.values(byType);
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return { byType, average };
}

/** Média geral de todos os itens do DRD do cargo atual (0 a drd.rate). */
const overallAverage = computed(() => {
  const drd = currentDrd.value;
  if (!drd?.drdTopics?.length) return 0;
  let sum = 0;
  let count = 0;
  for (const topic of drd.drdTopics) {
    for (const item of topic.drdTopicItems ?? []) {
      const { average } = getItemScores(item);
      sum += average;
      count++;
    }
  }
  return count ? sum / count : 0;
});

/** Percentual da média geral para o v-progress-circular (0–100). */
const overallPercentage = computed(() => {
  const rate = drdRate.value;
  return rate > 0 ? Math.round((overallAverage.value / rate) * 100) : 0;
});

/** Por tipo de avaliação: média das notas daquele tipo em todos os itens. */
const averageByType = computed(() => {
  const drd = currentDrd.value;
  if (!drd?.drdTopics?.length) return {} as Record<string, number>;
  const types = new Set<string>();
  const sumByType: Record<string, number> = {};
  const countByType: Record<string, number> = {};
  for (const topic of drd.drdTopics) {
    for (const item of topic.drdTopicItems ?? []) {
      const { byType } = getItemScores(item);
      for (const [type, score] of Object.entries(byType)) {
        types.add(type);
        sumByType[type] = (sumByType[type] ?? 0) + score;
        countByType[type] = (countByType[type] ?? 0) + 1;
      }
    }
  }
  const result: Record<string, number> = {};
  for (const type of types) {
    const n = countByType[type] ?? 0;
    result[type] = n ? (sumByType[type] ?? 0) / n : 0;
  }
  return result;
});

/** Percentual por tipo (0–100) para os v-progress-circular menores. */
function getPercentageByType(type: string): number {
  const rate = drdRate.value;
  const avg = averageByType.value[type] ?? 0;
  return rate > 0 ? Math.round((avg / rate) * 100) : 0;
}

const hasDrd = computed(() => !!currentDrd.value?.drdTopics?.length || !!currentDrd.value?.drdMetrics?.length);
</script>

<template>
  <v-card v-if="user" elevation="2" class="pa-4 overflow-hidden" style="height: 100%;">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-chart-donut</v-icon>
      Desempenho no cargo atual
    </v-card-title>
    <v-divider class="mb-4" />

    <template v-if="!hasDrd">
      <div class="text-center text-medium-emphasis py-6">
        Nenhum DRD configurado para o cargo. Associe um plano de carreira ao cargo para ver métricas e médias.
      </div>
    </template>

    <template v-else>
      <!-- Média geral + médias por tipo -->
      <div class="d-flex flex-wrap align-center justify-center justify-md-start gap-6 mb-6">
        <div class="d-flex flex-column align-center">
          <v-progress-circular
            :model-value="overallPercentage"
            :size="88"
            :width="8"
            color="primary"
            rotate="-90"
          >
            <span class="text-h6 font-weight-bold">{{ overallAverage.toFixed(1) }}</span>
          </v-progress-circular>
          <span class="text-caption text-medium-emphasis mt-2">Média geral</span>
          <span class="text-caption text-disabled">(escala 0–{{ drdRate }})</span>
        </div>
        <div class="d-flex flex-wrap gap-4 align-center">
          <div
            v-for="(config, type) in EVALUATION_TYPE_CONFIG"
            :key="type"
            class="d-flex flex-column align-center"
          >
            <v-progress-circular
              :model-value="getPercentageByType(type)"
              :size="56"
              :width="6"
              :color="config.color"
              rotate="-90"
            >
              <span class="text-caption font-weight-bold">{{ (averageByType[type] ?? 0).toFixed(1) }}</span>
            </v-progress-circular>
            <span class="text-caption text-medium-emphasis mt-1">{{ config.label }}</span>
          </div>
        </div>
      </div>

      <!-- Métricas do DRD (como no UserCareerPlanCard) -->
      <div v-if="currentDrd?.drdMetrics?.length" class="mt-6">
        <div class="text-subtitle-2 font-weight-bold mb-3">Métricas de performance</div>
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
                  <div class="text-caption text-disabled text-uppercase font-weight-bold">{{ metric.name }}</div>
                  <div class="text-h4 font-weight-black my-1">
                    {{ (metric.scoresByLevel as any)?.[0]?.min_score || '0' }}
                    <span class="text-subtitle-2 text-medium-emphasis">{{ getMetricTypeOption(metric.type)?.suffix }}</span>
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
                  :indeterminate="userPanel.loading"
                  height="4"
                  rounded
                  :color="getMetricTypeOption(metric.type)?.color"
                  class="opacity-20"
                />
              </div>
              <div class="text-caption mt-2 text-disabled">Meta para o nível alvo</div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </template>
  </v-card>
</template>
