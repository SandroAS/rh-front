<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store'

const evaluationApplicationStore = useEvaluationApplicationStore()

const totalEvaluations = computed(() => {
  if (evaluationApplicationStore.evaluations_applications_totals === null) return '--'
  return evaluationApplicationStore.evaluations_applications_totals.total
})

const completedEvaluations = computed(() => {
  if (evaluationApplicationStore.evaluations_applications_totals === null) return '--'
  return evaluationApplicationStore.evaluations_applications_totals.completed
})

const pendingEvaluations = computed(() => {
  if (evaluationApplicationStore.evaluations_applications_totals === null) return '--'
  return evaluationApplicationStore.evaluations_applications_totals.pending
})

const expiredEvaluations = computed(() => {
  if (evaluationApplicationStore.evaluations_applications_totals === null) return '--'
  return evaluationApplicationStore.evaluations_applications_totals.expired
})

onMounted(async () => {
  await evaluationApplicationStore.getEvaluationsApplicationsTotals()
})
</script>

<template>
  <v-card class="pa-4 h-100" elevation="2">
    <v-icon size="32" color="primary">mdi-file-document-outline</v-icon>
    <div class="text-h6 mt-2">Avaliações</div>
    <div class="text-h5 font-weight-bold">{{ totalEvaluations }}</div>
    
    <v-divider class="my-3"></v-divider>
    
    <div class="d-flex flex-column">
      <!-- Finalizadas -->
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-caption">Finalizadas:</span>
        <span 
          v-if="typeof completedEvaluations === 'string'"
          class="text-caption font-weight-medium"
        >
          {{ completedEvaluations }}
        </span>
        <span 
          v-else
          :class="completedEvaluations === 0 ? 'text-warning' : 'text-success'"
          class="text-caption font-weight-medium"
        >
          {{ completedEvaluations === 0 ? 'Nenhuma' : completedEvaluations }}
        </span>
      </div>
      
      <!-- Pendentes -->
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-caption">Pendentes:</span>
        <span 
          v-if="typeof pendingEvaluations === 'string'"
          class="text-caption font-weight-medium"
        >
          {{ pendingEvaluations }}
        </span>
        <span 
          v-else
          :class="pendingEvaluations === 0 ? 'text-success' : 'text-warning'"
          class="text-caption font-weight-medium"
        >
          {{ pendingEvaluations === 0 ? 'Nenhuma' : pendingEvaluations }}
        </span>
      </div>
      
      <!-- Expiradas -->
      <div class="d-flex justify-space-between align-center">
        <span class="text-caption">Expiradas:</span>
        <span 
          v-if="typeof expiredEvaluations === 'string'"
          class="text-caption font-weight-medium"
        >
          {{ expiredEvaluations }}
        </span>
        <span 
          v-else
          :class="expiredEvaluations === 0 ? 'text-success' : 'text-warning'"
          class="text-caption font-weight-medium"
        >
          {{ expiredEvaluations === 0 ? 'Nenhuma' : expiredEvaluations }}
        </span>
      </div>
    </div>
  </v-card>
</template>
