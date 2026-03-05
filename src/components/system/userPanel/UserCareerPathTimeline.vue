<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type {
  UserPanel,
  UserPanelDrdLevel,
  UserPanelEvaluationReceived,
} from '@/types/user/user-panel.type';

const props = defineProps<{
  user: UserPanel;
}>();

const emit = defineEmits(['progressbar']);

const userLevels = computed(() => {
  const levels = props.user.jobPosition?.drd?.levels ?? [];
  return [...levels].sort((a, b) => b.order - a.order);
});

/** Progressão do plano de carreira */
const progression = computed(() => {
  const positions = props.user.careerPlan?.careerPlanJobPositions ?? [];
  const currentJobUuid = props.user.jobPosition?.uuid;
  return [...positions]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      title: item.jobPosition?.title ?? 'Cargo não definido',
      date: null as string | null,
      isCurrent: Boolean(currentJobUuid && (item.job_position_uuid === currentJobUuid || item.jobPosition?.uuid === currentJobUuid)),
    }));
});

const isCurrentJob = (step: { title: string; isCurrent: boolean }) => step.isCurrent;

/** Percentual até o próximo cargo (baseado na posição atual da progressão) */
const progressToNext = computed(() => {
  const list = progression.value;
  if (list.length === 0) return 0;
  const currentIndex = list.findIndex((s) => s.isCurrent);
  if (currentIndex < 0) return 0;
  return Math.round(((currentIndex + 1) / list.length) * 100);
});

const progressBarColor = (percentage: number) => {
  if (percentage >= 90) return 'success';
  if (percentage >= 50) return 'yellow-darken-1';
  if (percentage >= 0) return 'warning';
  return 'primary';
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Data não definida';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getLevelColor = (order: number, isCurrentJob: boolean) => {
  if(isCurrentJob && props.user.jobPositionCurrentLevel?.order) {
    if (order === ((props.user.jobPositionCurrentLevel?.order ?? 0) + 1)) {
      return 'primary';
    }
    if (order < ((props.user.jobPositionCurrentLevel?.order ?? 0) + 1)) {
      return 'success';
    }
  }

  return 'grey-lighten-2';
}

const canCheckLevelIcon = (order: number, isCurrentJob: boolean) => {
  if(isCurrentJob && props.user.jobPositionCurrentLevel?.order) {
    if (order < ((props.user.jobPositionCurrentLevel?.order ?? 0) + 1)) {
      return true;
    }
  }

  return false;
}

/** Ordem do nível no DRD que corresponde ao nível atual do usuário (jobPositionCurrentLevel.order + 1) */
const currentLevelDrdOrder = computed(() => {
  const order = props.user.jobPositionCurrentLevel?.order;
  if (order == null) return null;
  return order + 1;
});

/** UUID do nível atual no DRD (level em drd.levels cujo order === currentLevelDrdOrder) */
const currentLevelDrdUuid = computed(() => {
  const order = currentLevelDrdOrder.value;
  if (order == null) return null;
  const level = props.user.jobPosition?.drd?.levels?.find((l) => l.order === order);
  return level?.uuid ?? null;
});

/**
 * Porcentagem de progresso no nível atual: considera os min_score do nível no DRD
 * e as respostas das últimas avaliações (por tipo) para ver quantos itens atingem o mínimo.
 * 100% = todos os itens avaliados atingem o min_score necessário.
 */
const currentLevelProgressPercentage = computed(() => {
  const levelUuid = currentLevelDrdUuid.value;
  const drd = props.user.jobPosition?.drd;
  const evaluations = props.user.evaluationsReceived ?? [];
  if (!levelUuid || !drd?.topics?.length || !evaluations.length) return 0;

  // 1) Montar lista de (nome do item, min_score) para o nível atual
  const itemsWithMinScore: { name: string; minScore: number }[] = [];
  for (const topic of drd.topics) {
    for (const item of topic.drdTopicItems ?? []) {
      const scoreEntry = item.scoresByLevel?.find((s) => s.drd_level_uuid === levelUuid);
      if (scoreEntry?.min_score != null) {
        const minScore = parseFloat(scoreEntry.min_score);
        if (!Number.isNaN(minScore)) {
          itemsWithMinScore.push({ name: item.name.trim(), minScore });
        }
      }
    }
  }

  if (itemsWithMinScore.length === 0) return 0;

  // 2) Última avaliação de cada tipo (FINISHED, ordenado por finished_at desc)
  const byType = new Map<string, UserPanelEvaluationReceived>();
  const finished = evaluations.filter((e) => e.status === 'FINISHED' && e.finished_at);
  const sorted = [...finished].sort(
    (a, b) => new Date(b.finished_at ?? 0).getTime() - new Date(a.finished_at ?? 0).getTime()
  );
  for (const ev of sorted) {
    if (!byType.has(ev.type)) byType.set(ev.type, ev);
  }

  // 3) Coletar todas as respostas dessas avaliações (primeira response completa de cada)
  const answersByItemName = new Map<string, number>();
  for (const ev of byType.values()) {
    const response = ev.responses?.find((r) => r.is_completed && r.answers?.length);
    if (!response?.answers) continue;
    for (const answer of response.answers) {
      const title = answer.question?.title?.trim();
      const numVal = answer.number_value != null ? parseFloat(answer.number_value) : NaN;
      if (!title || Number.isNaN(numVal)) continue;
      const current = answersByItemName.get(title);
      if (current == null || numVal > current) {
        answersByItemName.set(title, numVal);
      }
    }
  }

  // 4) Contar quantos itens atingem o min_score (match por título da pergunta ≈ nome do item)
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  let achieved = 0;
  for (const { name, minScore } of itemsWithMinScore) {
    const key = normalize(name);
    let found = false;
    for (const [answerTitle, score] of answersByItemName) {
      if (normalize(answerTitle) === key && score >= minScore) {
        found = true;
        break;
      }
    }
    if (found) achieved++;
  }

  return Math.round((achieved / itemsWithMinScore.length) * 100);
});

const isCurrentLevelProgressBar = (userLevel: UserPanelDrdLevel, isCurrentJob: boolean) => {
  if (!isCurrentJob || currentLevelDrdOrder.value == null) return false;
  return (userLevel.order - 1) === currentLevelDrdOrder.value;
};

const getLevelProgressBarPercentage = (order: number, isCurrentJob: boolean) => {
  const drdOrder = (currentLevelDrdOrder.value);
  if (!isCurrentJob || drdOrder == null) return 0;
  if ((order - 1) < drdOrder) return 100;
  if ((order - 1) === drdOrder) return currentLevelProgressPercentage.value;
  return 0;
};

onMounted(() => {
  const div = document.getElementById('career-path-container');
  if(div) {
    div.scrollTop = div.scrollHeight;
  }
})
</script>

<template>
  <v-card v-if="user.careerPlan?.uuid">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
      Jornada de Carreira -&#160;<b>{{ user.careerPlan.name }}</b>
    </v-card-title>
    <v-alert
      v-if="!user.jobPositionCurrentLevel?.uuid"
      type="warning"
      variant="tonal"
      density="compact"
      class="mx-4 mt-2"
      icon="mdi-alert"
    >
      Usuário não tem o nível do cargo configurado.
    </v-alert>
    <v-divider class="my-4"></v-divider>

    <v-card-text>
      <div id="career-path-container" class="career-path-container w-100">
        <div class="d-flex align-center w-100 mt-4">
          <div
            v-for="(step, index) in progression"
            :key="index"
          >
            <div class="d-flex align-end step-line-container">
              <div>
                <div v-for="userLevel in userLevels">
                  <div class="d-flex align-center" style="margin-right: -50px;">
                    <v-avatar
                      size="20"
                      :color="getLevelColor(userLevel.order, isCurrentJob(step))"
                      class="ma-2 ml-3"
                    >
                      <v-icon v-if="canCheckLevelIcon(userLevel.order, isCurrentJob(step))" size="15" color="white">mdi-check</v-icon>
                    </v-avatar>

                    <div class="text-caption font-weight-bold">{{ userLevel.name }}</div>
                  </div>
                  <div class="vertical-progress-container">
                    <v-progress-linear
                      class="vertical-progress-bar"
                      :model-value="getLevelProgressBarPercentage(userLevel.order, isCurrentJob(step))"
                      :color="progressBarColor(getLevelProgressBarPercentage(userLevel.order, isCurrentJob(step)))"
                      rounded
                    ></v-progress-linear>
                    <div
                      v-if="isCurrentLevelProgressBar(userLevel, isCurrentJob(step))"
                      class="text-caption text-center font-weight-bold vertical-percentage mr-6"
                      :class="`text-${progressBarColor(getLevelProgressBarPercentage(userLevel.order, isCurrentJob(step)))}`"
                    >
                      {{ getLevelProgressBarPercentage(userLevel.order, isCurrentJob(step)) }}%
                    </div>
                  </div>
                </div>

                <v-avatar
                  size="28"
                  :color="step.date ? 'success' : isCurrentJob(step) ? 'primary' : 'grey-lighten-2'"
                  class="ma-2"
                >
                  <v-icon v-if="step.date" color="white">mdi-check</v-icon>
                </v-avatar>
              </div>

              <div
                v-if="index < progression.length - 1"
                class="flex-grow-1"
              >
                <div v-if="isCurrentJob(step)" class="teste2">
                  <div
                    class="text-caption text-center font-weight-bold"
                    :class="`text-${progressBarColor(progressToNext)}`"
                  >
                    {{ progressToNext }}%
                  </div>
                  <v-progress-linear
                    :model-value="progressToNext"
                    :color="progressBarColor(progressToNext)"
                    class="custom-progressbar mb-5"
                    rounded
                  ></v-progress-linear>
                </div>
                <v-progress-linear
                  v-else
                  :model-value="100"
                  color="blue-grey-lighten-4"
                  class="custom-progressbar mb-5"
                  rounded
                ></v-progress-linear>
              </div>
            </div>

            <div class="d-flex flex-column step-container">
              <div class="text-caption font-weight-bold" style="white-space: nowrap;">
                {{ step.title }}
              </div>
              <span v-if="step.date" class="text-caption text-medium-emphasis">
                Início: {{ formatDate(step.date) }}
              </span>
              <span v-else class="text-caption text-medium-emphasis">
                Próximo cargo
              </span>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.teste2 {
  cursor: pointer;
  transition: transform .2s ease-in-out;
}

.teste2:hover {
  transform: scale(1.1);
}

.teste {
  cursor: pointer;
  transition: transform .2s ease-in-out;
}

.teste:hover {
  transform: rotate(180deg) scale(1.1);
}

.career-path-container {
  overflow: auto;
  max-height: 340px;
  padding: 20px;
}

.step-container {
  min-width: 150px; /* Garante que os títulos não fiquem espremidos */
  padding: 0 8px;
}

.step-line-container {
  flex-grow: 1; /* Ocupa o espaço disponível para a linha */
}

/* Remove o grow do último item para que a linha não estenda além */
.step-line-container:last-child {
  flex-grow: 0;
}

.custom-progressbar {
  height: 10px;
  position: relative;
}

/* Garante que o container da linha da timeline tenha o tamanho correto */
.d-flex.w-100.flex-nowrap {
  flex-wrap: nowrap !important;
  white-space: nowrap;
}

.vertical-progress-container {
  transform: rotate(180deg);
  margin-top: 29px;
  margin-bottom: 34px;
  margin-right: -13px;
  margin-left: -14px;
}

.vertical-progress-bar {
  transform: rotate(90deg) translateX(0);
  width: 100%;
  height: 100%;
}

.vertical-percentage {
  transform: rotate(270deg);
  margin-top: -16px;
}
</style>