<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { UserPanel, UserPanelEvaluationReceived } from '@/types/user/user-panel.type';

const props = defineProps<{
  user: UserPanel;
}>();

/** * HELPER: Obtém o item do plano de carreira que corresponde ao cargo atual 
 */
const currentCareerItem = computed(() => {
  const currentJobUuid = props.user.jobPosition?.uuid;
  if (!currentJobUuid) return null;
  return props.user.careerPlan?.careerPlanJobPositions?.find(
    item => item.job_position_uuid === currentJobUuid || item.jobPosition?.uuid === currentJobUuid
  );
});

/** 1. Lógica de Níveis (Vertical) */
const userLevels = computed(() => {
  const levels = currentCareerItem.value?.jobPosition?.drd?.drdLevels ?? [];
  return [...levels].sort((a, b) => b.order - a.order);
});

/** 2. Lógica de Cargos (Horizontal) */
const progression = computed(() => {
  const positions = props.user.careerPlan?.careerPlanJobPositions ?? [];
  const currentJobUuid = props.user.jobPosition?.uuid;
  
  return [...positions]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      title: item.jobPosition?.title ?? 'Cargo não definido',
      uuid: item.jobPosition?.uuid,
      drd: item.jobPosition?.drd,
      isCurrent: Boolean(currentJobUuid && (item.job_position_uuid === currentJobUuid || item.jobPosition?.uuid === currentJobUuid)),
    }));
});

const currentStepIndex = computed(() => progression.value.findIndex((s) => s.isCurrent));

/** * FUNÇÃO CORE: Calcula progresso baseado em DRD e Avaliações */
function calculateProgress(levelUuid: string | null, jobTitleFilter?: string): number {
  // Busca o DRD do cargo atual (via plano de carreira)
  const drd = currentCareerItem.value?.jobPosition?.drd;
  const evaluations = props.user.evaluationsReceived ?? [];
  if (!levelUuid || !evaluations.length) return 0;

  let filteredEvals = evaluations.filter(e => e.status === 'FINISHED' && e.finished_at);
  if (jobTitleFilter) {
    const filterLower = jobTitleFilter.toLowerCase().trim();
    filteredEvals = filteredEvals.filter(e => e.name?.toLowerCase().includes(filterLower));
  }
  
  if (filteredEvals.length === 0) return 0;

  const itemsWithMinScore: { name: string; minScore: number }[] = [];
  
  if (drd?.drdTopics) {
    for (const topic of drd.drdTopics) {
      for (const item of topic.drdTopicItems ?? []) {
        const scoreEntry = item.scoresByLevel?.find(s => s.drd_level_uuid === levelUuid);
        if (scoreEntry?.min_score) {
          itemsWithMinScore.push({ 
            name: item.name.trim(), 
            minScore: parseFloat(scoreEntry.min_score) 
          });
        }
      }
    }
  }

  if (itemsWithMinScore.length === 0) return 0;

  const byType = new Map<string, UserPanelEvaluationReceived>();
  const sorted = [...filteredEvals].sort((a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime());
  for (const ev of sorted) {
    if (!byType.has(ev.type)) {
      byType.set(ev.type, ev);
    }
  }

  const answersByItemName = new Map<string, number>();
  for (const ev of byType.values()) {
    const response = ev.responses?.find(r => r.is_completed && r.answers?.length);
    for (const answer of response?.answers ?? []) {
      const title = answer.question?.title?.trim();
      const val = parseFloat(answer.number_value ?? '');
      if (!title || isNaN(val)) continue;
      if (!answersByItemName.has(title) || val > answersByItemName.get(title)!) answersByItemName.set(title, val);
    }
  }

  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  let achieved = 0;
  for (const { name, minScore } of itemsWithMinScore) {
    const key = normalize(name);
    for (const [answerTitle, score] of answersByItemName) {
      if (normalize(answerTitle) === key && score >= minScore) {
        achieved++;
        break;
      }
    }
  }
  return Math.round((achieved / itemsWithMinScore.length) * 100);
}

/** 3. Nível Atual (Vertical) */
const currentLevelDrdOrder = computed(() => (props.user.jobPositionCurrentLevel?.order ?? 0));

const currentLevelDrdUuid = computed(() => 
  currentCareerItem.value?.jobPosition?.drd?.drdLevels?.find(l => (l.order) === currentLevelDrdOrder.value)?.uuid ?? null
);

const currentLevelProgressPercentage = computed(() => calculateProgress(currentLevelDrdUuid.value));

const getLevelProgressBarPercentage = (order: number, isCurrentJob: boolean) => {
  if (!isCurrentJob) return 0;
  if (order < currentLevelDrdOrder.value) return 100;
  if (order === currentLevelDrdOrder.value) return currentLevelProgressPercentage.value;
  return 0;
};

/** 4. Próximo Cargo (Horizontal) */
const nextStepTitle = computed(() => {
  const idx = currentStepIndex.value;
  return (idx >= 0 && idx < progression.value.length - 1) ? progression.value[idx + 1].title : '';
});

const firstLevelDrdUuid = computed(() => {
  const levels = currentCareerItem.value?.jobPosition?.drd?.drdLevels ?? [];
  return [...levels].sort((a, b) => a.order - b.order)[0]?.uuid ?? null;
});

const nextJobProgressPercentage = computed(() => {
  if (!nextStepTitle.value) return 0;
  return calculateProgress(firstLevelDrdUuid.value, nextStepTitle.value);
});

function getStepConnectorProgress(index: number): { value: number; showLabel: boolean } {
  const currentIdx = currentStepIndex.value;
  if (currentIdx < 0 || index < currentIdx) return { value: 100, showLabel: false };
  if (index === currentIdx) {
    return { value: nextJobProgressPercentage.value, showLabel: true };
  }
  return { value: 0, showLabel: false };
}

const stepConnectorProgressList = computed(() => progression.value.map((_, i) => getStepConnectorProgress(i)));

const progressBarColor = (percentage: number, isInactive = false) => {
  if (isInactive) return 'blue-grey-lighten-4';
  if (percentage >= 90) return 'success';
  if (percentage >= 50) return 'yellow-darken-1';
  return 'warning';
};

const getLevelColor = (order: number, isCurrentJob: boolean) => {
  if (!isCurrentJob) return 'grey-lighten-2';
  if (order === currentLevelDrdOrder.value) return 'primary';
  if (order < currentLevelDrdOrder.value) return 'success';
  return 'grey-lighten-2';
};

onMounted(() => {
  const div = document.getElementById('career-path-container');
  if (div) div.scrollLeft = 0;
});
</script>

<template>
  <!-- O Template permanece o mesmo -->
  <v-card v-if="user.careerPlan?.uuid" elevation="0" border>
    <v-card-title class="text-h6 d-flex align-center pa-4">
      <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
      Jornada de Carreira - <b>{{ user.careerPlan.name }}</b>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-0">
      <div id="career-path-container" class="career-path-container">
        <div class="d-flex align-start flex-nowrap pa-6">
          <div v-for="(step, index) in progression" :key="index" class="d-flex">
            
            <div class="d-flex flex-column align-center" style="min-width: 140px;">
              <div class="levels-stack mb-4">
                <div v-for="userLevel in userLevels" :key="userLevel.uuid" class="level-item">
                  <div class="d-flex align-center mb-1">
                    <v-avatar size="18" :color="getLevelColor(userLevel.order, step.isCurrent)" class="mr-2">
                      <v-icon v-if="userLevel.order < currentLevelDrdOrder && step.isCurrent" size="12" color="white">mdi-check</v-icon>
                      <span v-else class="text-caption text-white" style="font-size: 10px !important;">{{ userLevel.order }}</span>
                    </v-avatar>
                    <span class="text-caption font-weight-bold text-truncate" style="max-width: 80px;">{{ userLevel.name }}</span>
                  </div>
                  
                  <div class="vertical-bar-wrapper">
                    <v-progress-linear
                      vertical
                      :model-value="getLevelProgressBarPercentage(userLevel.order, step.isCurrent)"
                      :color="progressBarColor(getLevelProgressBarPercentage(userLevel.order, step.isCurrent), !step.isCurrent)"
                      height="6"
                      rounded
                    ></v-progress-linear>
                    <div v-if="step.isCurrent && userLevel.order === currentLevelDrdOrder" class="percentage-label">
                      {{ currentLevelProgressPercentage }}%
                    </div>
                  </div>
                </div>
              </div>

              <v-avatar size="32" :color="step.isCurrent ? 'primary' : 'grey-lighten-2'" class="elevation-2">
                <v-icon v-if="index < currentStepIndex" color="white" size="20">mdi-check</v-icon>
                <v-icon v-else color="white" size="20">{{ step.isCurrent ? 'mdi-account-star' : 'mdi-lock' }}</v-icon>
              </v-avatar>

              <div class="mt-3 text-center">
                <div class="text-subtitle-2 font-weight-bold text-truncate" style="max-width: 130px;">{{ step.title }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ step.isCurrent ? 'Cargo Atual' : (index < currentStepIndex ? 'Concluído' : 'Próximo objetivo') }}
                </div>
              </div>
            </div>

            <div v-if="index < progression.length - 1" class="connector-wrapper">
              <div class="connector-content">
                <div v-if="stepConnectorProgressList[index].showLabel" class="text-caption font-weight-black mb-1" :class="`text-${progressBarColor(stepConnectorProgressList[index].value)}`">
                  {{ stepConnectorProgressList[index].value }}% para próximo cargo
                </div>
                <v-progress-linear
                  :model-value="stepConnectorProgressList[index].value"
                  :color="progressBarColor(stepConnectorProgressList[index].value, !stepConnectorProgressList[index].showLabel)"
                  height="8"
                  rounded
                ></v-progress-linear>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.career-path-container {
  overflow-x: auto;
  overflow-y: hidden;
  background: #fdfdfd;
}
.levels-stack {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 10px;
}
.level-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 2px;
}
.vertical-bar-wrapper {
  height: 30px;
  margin-left: 9px;
  position: relative;
  display: flex;
  align-items: center;
}
.percentage-label {
  position: absolute;
  left: 12px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}
.connector-wrapper {
  min-width: 120px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 58px;
  flex-grow: 1;
}
.connector-content {
  width: 100%;
  padding: 0 8px;
  text-align: center;
}
.career-path-container::-webkit-scrollbar {
  height: 6px;
}
.career-path-container::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}
</style>
