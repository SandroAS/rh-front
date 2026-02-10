<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAccountUserStore } from '@/stores/account-user.store'

const accountUserStore = useAccountUserStore()

const totalEmployees = computed(() => {
  if (accountUserStore.account_users_totals === null) return '--'
  return accountUserStore.account_users_totals.total
})

const pendingJobPosition = computed(() => {
  if (accountUserStore.account_users_totals === null) return '--'
  return accountUserStore.account_users_totals.pending_job_position_settings
})

const pendingEvaluation = computed(() => {
  if (accountUserStore.account_users_totals === null) return '--'
  return accountUserStore.account_users_totals.pending_evaluation_settings
})

const notEvaluatedYet = computed(() => {
  if (accountUserStore.account_users_totals === null) return '--'
  return accountUserStore.account_users_totals.not_evaluated_yet
})

onMounted(async () => {
  await accountUserStore.getAccountUsersTotals()
})
</script>

<template>
  <v-card class="pa-4 h-100" elevation="2">
    <v-icon size="32" color="primary">mdi-account</v-icon>
    <div class="text-h6 mt-2">Colaboradores</div>
    <div class="text-h5 font-weight-bold">{{ totalEmployees }}</div>
    
    <v-divider class="my-3"></v-divider>
    
    <div class="d-flex flex-column">
      <!-- Sem cargo vinculado -->
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-caption">Sem cargo vinculado:</span>
        <span 
          v-if="typeof pendingJobPosition === 'string'"
          class="text-caption font-weight-medium"
        >
          {{ pendingJobPosition }}
        </span>
        <span 
          v-else
          :class="pendingJobPosition === 0 ? 'text-success' : 'text-warning'"
          class="text-caption font-weight-medium"
        >
          {{ pendingJobPosition === 0 ? 'Todos com cargo' : pendingJobPosition }}
        </span>
      </div>
      
      <!-- Sem avaliação agendada/realizada -->
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-caption">Sem avaliação agendada:</span>
        <span 
          v-if="typeof pendingEvaluation === 'string'"
          class="text-caption font-weight-medium"
        >
          {{ pendingEvaluation }}
        </span>
        <span 
          v-else
          :class="pendingEvaluation === 0 ? 'text-success' : 'text-warning'"
          class="text-caption font-weight-medium"
        >
          {{ pendingEvaluation === 0 ? 'Todas agendadas' : pendingEvaluation }}
        </span>
      </div>
      
      <!-- Nunca avaliados -->
      <div class="d-flex justify-space-between align-center">
        <span class="text-caption">Nunca avaliados:</span>
        <span 
          v-if="typeof notEvaluatedYet === 'string'"
          class="text-caption font-weight-medium"
        >
          {{ notEvaluatedYet }}
        </span>
        <span 
          v-else
          :class="notEvaluatedYet === 0 ? 'text-success' : 'text-warning'"
          class="text-caption font-weight-medium"
        >
          {{ notEvaluatedYet === 0 ? 'Todos avaliados' : notEvaluatedYet }}
        </span>
      </div>
    </div>
  </v-card>
</template>
