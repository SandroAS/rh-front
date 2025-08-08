<script setup lang="ts">
import { ref, computed } from 'vue';
import type { User } from '@/types/teamPanel/project-mocks.type';

const props = defineProps<{
  user: User;
}>();

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
  progressToNext: 70,
});

const isCurrentJob = (stepTitle: string) => {
  return careerPlan.value.currentJobTitle === stepTitle;
};

// A cor da barra de progresso pode mudar com base na porcentagem
const progressBarColor = computed(() => {
  if (careerPlan.value.progressToNext >= 90) return 'success';
  if (careerPlan.value.progressToNext >= 50) return 'warning';
  return 'primary';
});

// Função para formatar a data
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Data não definida';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR');
};
</script>

<template>
  <v-card class="pa-4">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
      Jornada de Carreira - {{ user.name }}
    </v-card-title>
    <v-divider class="my-4"></v-divider>

    <v-card-text>
      <div class="career-path-container w-100">
        <div class="d-flex align-center w-100 mt-4">
          <div
            v-for="(step, index) in careerPlan.progression"
            :key="index"
            class=""
          >
            <div class="d-flex flex-column step-container">
              <div class="text-subtitle-1 font-weight-bold" style="white-space: nowrap;">{{ step.title }}</div>
              <span v-if="step.date" class="text-caption text-medium-emphasis">
                Início: {{ formatDate(step.date) }}
              </span>
              <span v-else class="text-caption text-medium-emphasis">
                Próximo cargo
              </span>
            </div>
            <div class="d-flex align-center step-line-container">
              <v-avatar
                size="28"
                :color="step.date ? 'success' : isCurrentJob(step.title) ? 'primary' : 'grey-lighten-2'"
                class="ma-2"
              >
                <v-icon v-if="step.date" color="white">mdi-check</v-icon>
              </v-avatar>
              
              <div
                v-if="index < careerPlan.progression.length - 1"
                class="flex-grow-1"
              >
                <div v-if="isCurrentJob(step.title)" class="progress-bar-wrapper">
                  <div class="text-caption text-center font-weight-bold mb-1" :class="`text-${progressBarColor}`">
                    {{ careerPlan.progressToNext }}%
                  </div>
                  <v-progress-linear
                    :model-value="careerPlan.progressToNext"
                    :color="progressBarColor"
                    class="custom-progressbar custom-progressbar-margin"
                    rounded
                  ></v-progress-linear>
                </div>
                <v-progress-linear
                  v-else
                  :model-value="100"
                  color="blue-grey-lighten-4"
                  class="custom-progressbar"
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
.custom-progressbar-margin {
 margin-bottom: 22.8px;
}

.career-path-container {
  overflow-x: auto;
}

.step-container {
  min-width: 180px; /* Garante que os títulos não fiquem espremidos */
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
</style>