<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { UserPanel } from '@/types/user/user-panel.type';

const props = defineProps<{
  user: UserPanel;
}>();

const emit = defineEmits(['progressbar']);

const userLevels = computed(() => {
  return props.user.jobPosition.drd.levels.sort((a, b) => b.order - a.order);
});

// Dados mockados para simular um plano de carreira
const careerPlan = ref({
  currentJobTitle: 'Desenvolvedor',
  progression: [
    { title: 'Desenvolvedor', date: '2023-01-15' },
    { title: 'Tech Lead', date: null },
    { title: 'Staff Engineer', date: null },
    { title: 'Principal Engineer', date: null },
    { title: 'Arquiteto de Soluções', date: null }
  ],
  progressToNext: 30,
});

const isCurrentJob = (stepTitle: string) => {
  return careerPlan.value.currentJobTitle === stepTitle;
};

// A cor da barra de progresso pode mudar com base na porcentagem
const progressBarColor = computed(() => {
  if (careerPlan.value.progressToNext >= 90) return 'success';
  if (careerPlan.value.progressToNext >= 50) return 'warning';
  if (careerPlan.value.progressToNext >= 30) return 'warning';
  return 'primary';
});

// Função para formatar a data
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Data não definida';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR');
};

onMounted(() => {
  const div = document.getElementById('career-path-container');
  if(div) {
    div.scrollTop = div.scrollHeight;
  }
})
</script>

<template>
  <v-card class="">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
      Jornada de Carreira
    </v-card-title>
    <v-divider class="my-4"></v-divider>

    <v-card-text>
      <div id="career-path-container" class="career-path-container w-100">
        <div class="d-flex align-center w-100 mt-4">
          <div
            v-for="(step, index) in careerPlan.progression"
            :key="index"
          >
            <div class="d-flex align-end step-line-container">
              <div>
                <div v-for="userLevel in userLevels">
                  <div class="d-flex align-center" style="margin-right: -50px;">
                    <v-avatar
                      size="20"
                      :color="'grey-lighten-2'"
                      class="ma-2 ml-3"
                    >
                      <!-- <v-icon v-if="step.date" size="15" color="white">mdi-check</v-icon> -->
                    </v-avatar>
                    <div class="text-caption font-weight-bold">{{ userLevel.name }}</div>
                  </div>
                  <template v-if="false">
                    <div class="vertical-progress-container">
                      <v-progress-linear
                        class="vertical-progress-bar"
                        :model-value="careerPlan.progressToNext"
                        :color="progressBarColor"
                        rounded
                      ></v-progress-linear>
                      <div class="text-caption text-center font-weight-bold vertical-percentage mr-6" :class="`text-${progressBarColor}`">
                        {{ careerPlan.progressToNext }}%
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="vertical-progress-container">
                      <v-progress-linear
                        class="vertical-progress-bar"
                        :model-value="100"
                        color="blue-grey-lighten-4"
                        rounded
                      ></v-progress-linear>
                    </div>
                  </template>
                </div>

                <div class="d-flex align-center" style="margin-right: -50px;">
                  <v-avatar
                    size="20"
                    :color="'grey-lighten-2'"
                    class="ma-2 ml-3"
                  >
                    <!-- <v-icon v-if="step.date" size="15" color="white">mdi-check</v-icon> -->
                  </v-avatar>
                  <div class="text-caption font-weight-bold">Nível II</div>
                </div>
                <template v-if="isCurrentJob(step.title)">
                  <div class="vertical-progress-container teste" @click.prevent="emit('progressbar', step)">
                    <v-progress-linear
                      class="vertical-progress-bar"
                      :model-value="60"
                      :color="'warning'"
                      rounded
                    ></v-progress-linear>
                    <div class="text-caption text-center font-weight-bold vertical-percentage mr-6" :class="`text-${'warning'}`">
                      {{ 60 }}%
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="vertical-progress-container">
                    <v-progress-linear
                      class="vertical-progress-bar"
                      :model-value="100"
                      color="blue-grey-lighten-4"
                      rounded
                    ></v-progress-linear>
                  </div>
                </template>

                <v-avatar
                  size="28"
                  :color="step.date ? 'success' : isCurrentJob(step.title) ? 'primary' : 'grey-lighten-2'"
                  class="ma-2"
                >
                  <v-icon v-if="step.date" color="white">mdi-check</v-icon>
                </v-avatar>
              </div>

              <div
                v-if="index < careerPlan.progression.length - 1"
                class="flex-grow-1"
              >
                <div v-if="isCurrentJob(step.title)" class="teste2">
                  <div class="text-caption text-center font-weight-bold" :class="`text-${progressBarColor}`">
                    {{ careerPlan.progressToNext }}%
                  </div>
                  <v-progress-linear
                    :model-value="careerPlan.progressToNext"
                    :color="progressBarColor"
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
  /* Altera a orientação da barra */

  transform: rotate(90deg) translateX(0);
  
  /* Ajusta a largura e a altura para o novo alinhamento */
  width: 100%; /* Ocupa a altura do contêiner */
  height: 100%; /* Ocupa a largura do contêiner */
}

.vertical-percentage {
  transform: rotate(270deg);
  margin-top: -16px;
}
</style>