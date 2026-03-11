<script setup lang="ts">
import { computed } from 'vue';
import type { UserPanel, UserPanelDrd, UserPanelDrdTopicItem, UserPanelEvaluationReceived } from '@/types/user/user-panel.type';
import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type';

const props = defineProps<{
  user: UserPanel;
}>();

const avatarSrc = computed(() => props.user.profile_img_url ?? null);

const avatarInitial = computed(() => {
  const name = props.user.name?.trim() || '';
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '?';
});

const jobTitle = computed(() => props.user.jobPosition?.title ?? '-');

/** Cargo completo do usuário (do plano de carreira), quando existir. */
const currentJobPosition = computed(() => {
  const currentJobUuid = props.user?.jobPosition?.uuid;
  if (!currentJobUuid) return null;
  return props.user?.careerPlan?.careerPlanJobPositions?.find(
    (item) => item.job_position_uuid === currentJobUuid || item.jobPosition?.uuid === currentJobUuid
  )?.jobPosition ?? null;
});

const levelsGroupName = computed(() => currentJobPosition.value?.levelsGroup?.name ?? null);

const EVALUATION_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  [EvaluationType.SELF]: { label: 'Autoavaliação', color: 'indigo' },
  [EvaluationType.LEADER]: { label: 'Líder', color: 'amber-darken-2' },
  [EvaluationType.PEER]: { label: 'Par', color: 'green' },
};

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
</script>

<template>
  <v-card elevation="2" class="pa-4 user-profile-card" style="height: fit-content;">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-account</v-icon>
      Perfil
    </v-card-title>
    <v-divider class="mb-4" />
    <div class="d-flex flex-column align-center mb-4">
      <v-avatar size="100" class="mb-3" color="primary">
        <v-img v-if="avatarSrc" :src="avatarSrc" :alt="user.name" cover />
        <span v-else class="text-h4 text-white">{{ avatarInitial }}</span>
      </v-avatar>
      <div class="text-h5 font-weight-bold">{{ user.name }}</div>
      <div class="text-subtitle-1 text-medium-emphasis">{{ jobTitle }}</div>
      <v-chip
        v-if="user.jobPositionCurrentLevel"
        color="primary"
        variant="tonal"
        density="compact"
        class="mt-2"
        label
      >
        {{ user.jobPositionCurrentLevel.name }}
      </v-chip>
    </div>

    <v-divider class="mb-4" />

    <div v-if="currentJobPosition?.drd" class="d-flex align-center mb-2">
      <v-icon start icon="mdi-star-outline"></v-icon>
      <div class="text-body-2">Escala de avaliação: {{ currentJobPosition.drd.rate }}</div>
    </div>
    <div v-if="user.evaluationsReceived?.length !== undefined" class="d-flex align-center">
      <v-icon start icon="mdi-clipboard-list-outline"></v-icon>
      <div class="text-body-2">{{ user.evaluationsReceived.length }} avaliação(ões) recebida(s)</div>
    </div>

    <v-divider class="my-4"/>

    <!-- Média geral + médias por tipo -->
    <div class="d-flex align-center justify-space-between">
      <span class="text-overline font-weight-bold">Notas de Avaliação:</span>
      <span class="text-caption text-disabled text-right">(escala 0–{{ drdRate }})</span>
    </div>
    <div class="d-flex flex-wrap align-center justify-center justify-md-start gap-6">
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

  </v-card>
</template>

<style scoped>
.user-profile-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
