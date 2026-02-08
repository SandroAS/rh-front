<script setup lang="ts">
import { onMounted, computed } from 'vue'
import EmployeesProgressionChart from '@/components/system/dashboard/EmployeesProgressionChart.vue'
import TeamsProgressionsList from '@/components/system/dashboard/TeamsProgressionsList.vue'
import TopFiveProgressionsList from '@/components/system/dashboard/TopFiveProgressionsList.vue'
import PendingEvaluationsList from '@/components/system/dashboard/PendingEvaluationsList.vue'
import { useAccountUserStore } from '@/stores/account-user.store'
import { useTeamStore } from '@/stores/team.store'
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store'

const accountUserStore = useAccountUserStore()
const teamStore = useTeamStore()
const evaluationApplicationStore = useEvaluationApplicationStore()

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

const totalTeams = computed(() => {
  if (teamStore.teams_totals === null) return '--'
  return teamStore.teams_totals.total
})

const pendingSector = computed(() => {
  if (teamStore.teams_totals === null) return '--'
  return teamStore.teams_totals.pending_sector_settings
})

const exceededTeamMembers = computed(() => {
  if (teamStore.teams_totals === null) return '--'
  return teamStore.teams_totals.exceeded_team_members
})

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

const totalProgression = 250.75

onMounted(async () => {
  await accountUserStore.getAccountUsersTotals()
  await teamStore.getTeamsTotals()
  await evaluationApplicationStore.getEvaluationsApplicationsTotals()
})
</script>

<template>
  <v-container fluid>
    <!-- Totalizadores -->
    <v-row dense class="mb-6">
      <v-col cols="12" md="4">
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
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 h-100" elevation="2">
          <v-icon size="32" color="primary">mdi-account-group</v-icon>
          <div class="text-h6 mt-2">Times</div>
          <div class="text-h5 font-weight-bold">{{ totalTeams }}</div>
          
          <v-divider class="my-3"></v-divider>
          
          <div class="d-flex flex-column">
            <!-- Sem setor vinculado -->
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption">Sem setor vinculado:</span>
              <span 
                v-if="typeof pendingSector === 'string'"
                class="text-caption font-weight-medium"
              >
                {{ pendingSector }}
              </span>
              <span 
                v-else
                :class="pendingSector === 0 ? 'text-success' : 'text-warning'"
                class="text-caption font-weight-medium"
              >
                {{ pendingSector === 0 ? 'Todos com setor' : pendingSector }}
              </span>
            </div>
            
            <!-- Times com mais de 10 pessoas -->
            <div class="d-flex justify-space-between align-center">
              <span class="text-caption">Com mais de 10 pessoas:</span>
              <span 
                v-if="typeof exceededTeamMembers === 'string'"
                class="text-caption font-weight-medium"
              >
                {{ exceededTeamMembers }}
              </span>
              <span 
                v-else
                :class="exceededTeamMembers === 0 ? 'text-success' : 'text-warning'"
                class="text-caption font-weight-medium"
              >
                {{ exceededTeamMembers === 0 ? 'Nenhum' : exceededTeamMembers }}
              </span>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
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
                :class="completedEvaluations === 0 ? 'text-success' : 'text-warning'"
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
      </v-col>
    </v-row>

    <!-- <EmployeesProgressionChart /> -->

    <v-row class="mt-6">
      <!-- <v-col cols="12" lg="4" md="6">
        <TeamsProgressionsList />
      </v-col>
      <v-col cols="12" lg="4" md="6">
        <TopFiveProgressionsList />
      </v-col> -->
      <v-col cols="12" lg="4" md="6">
        <PendingEvaluationsList />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h3 {
  font-weight: 600;
}
</style>
