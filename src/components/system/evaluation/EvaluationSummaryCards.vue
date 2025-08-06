<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  applications: any[];
}>();

const totals = computed(() => {
  if (!props.applications) {
    return {
      totalApplications: 0,
      completedApplications: 0,
      selfEvaluations: 0,
      completedSelfEvaluations: 0,
      evaluators: new Set(),
      pendingEvaluators: new Set(),
    };
  }

  let totalApplications = 0;
  let completedApplications = 0;
  let selfEvaluations = 0;
  let completedSelfEvaluations = 0;
  const allEvaluators = new Set();
  const pendingEvaluators = new Set();

  props.applications.forEach(app => {
    // Total de aplicações consideradas
    totalApplications++;
    if (app.status === 'completed') {
      completedApplications++;
    }

    // Contagem de autoavaliações
    if (app.type === 'self') {
      selfEvaluations++;
      if (app.status === 'completed') {
        completedSelfEvaluations++;
      }
    }

    // Contagem de avaliadores pendentes
    allEvaluators.add(app.evaluator_collaborator_uuid);
    if (app.status === 'pending' || app.status === 'in_progress') {
      pendingEvaluators.add(app.evaluator_collaborator_uuid);
    }
  });

  return {
    totalApplications,
    completedApplications,
    selfEvaluations,
    completedSelfEvaluations,
    totalEvaluators: allEvaluators.size,
    pendingEvaluators: pendingEvaluators.size,
  };
});

const completedApplicationsPercentage = computed(() => {
  if (totals.value.totalApplications === 0) return 0;
  return ((totals.value.completedApplications / totals.value.totalApplications) * 100).toFixed(1);
});

const completedSelfEvaluationsPercentage = computed(() => {
  if (totals.value.selfEvaluations === 0) return 0;
  return ((totals.value.completedSelfEvaluations / totals.value.selfEvaluations) * 100).toFixed(1);
});

const pendingEvaluatorsPercentage = computed(() => {
  if (totals.value.totalEvaluators === 0) return 0;
  return ((+(totals.value.pendingEvaluators) / (totals.value.totalEvaluators || 0)) * 100).toFixed(1);
});
</script>

<template>
  <div class="d-flex flex-wrap gap-4 justify-space-between mb-8">
    <v-card class="pa-4 flex-grow-1" outlined>
      <div class="text-subtitle-1 text-medium-emphasis">Avaliações Respondidas</div>
      <div class="d-flex align-end">
        <span class="text-h3 font-weight-bold mr-2 text-primary">{{ totals.completedApplications }}</span>
        <span class="text-subtitle-1 text-medium-emphasis">/{{ totals.totalApplications }}</span>
      </div>
      <div class="text-caption mt-2">
        <v-progress-linear
          :model-value="completedApplicationsPercentage"
          color="success"
          height="10"
          rounded
        ></v-progress-linear>
        <div class="text-success mt-1">{{ completedApplicationsPercentage }}%</div>
      </div>
    </v-card>

    <v-card class="pa-4 flex-grow-1" outlined>
      <div class="text-subtitle-1 text-medium-emphasis">Autoavaliações Respondidas</div>
      <div class="d-flex align-end">
        <span class="text-h3 font-weight-bold mr-2 text-primary">{{ totals.completedSelfEvaluations }}</span>
        <span class="text-subtitle-1 text-medium-emphasis">/{{ totals.selfEvaluations }}</span>
      </div>
      <div class="text-caption mt-2">
        <v-progress-linear
          :model-value="completedSelfEvaluationsPercentage"
          color="info"
          height="10"
          rounded
        ></v-progress-linear>
        <div class="text-info mt-1">{{ completedSelfEvaluationsPercentage }}%</div>
      </div>
    </v-card>

    <v-card class="pa-4 flex-grow-1" outlined>
      <div class="text-subtitle-1 text-medium-emphasis">Avaliadores com Pendência</div>
      <div class="d-flex align-end">
        <span class="text-h3 font-weight-bold mr-2 text-error">{{ totals.pendingEvaluators }}</span>
        <span class="text-subtitle-1 text-medium-emphasis">/{{ totals.totalEvaluators }}</span>
      </div>
      <div class="text-caption mt-2">
        <v-progress-linear
          :model-value="pendingEvaluatorsPercentage"
          color="error"
          height="10"
          rounded
        ></v-progress-linear>
        <div class="text-error mt-1">{{ pendingEvaluatorsPercentage }}%</div>
      </div>
    </v-card>
  </div>
</template>
