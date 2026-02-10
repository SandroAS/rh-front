<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTeamStore } from '@/stores/team.store'

const teamStore = useTeamStore()

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

onMounted(async () => {
  await teamStore.getTeamsTotals()
})
</script>

<template>
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
</template>
