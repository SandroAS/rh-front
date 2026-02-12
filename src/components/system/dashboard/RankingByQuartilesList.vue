<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRankingByQuartiles } from '@/services/evaluation-application.service'
import type { RankingQuartileGroup, QuartileLabel } from '@/types/evaluationApplication/ranking-by-quartiles.type'
import { getInitials } from '@/utils/getInitialsFromName.util'

const quartiles = ref<RankingQuartileGroup[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const quartileLabelMap: Record<QuartileLabel, string> = {
  top_25: 'Top 25%',
  second_25: '25% – 50%',
  third_25: '50% – 75%',
  bottom_25: 'Últimos 25%'
}

const quartileColorMap: Record<QuartileLabel, string> = {
  top_25: 'success',
  second_25: 'info',
  third_25: 'warning',
  bottom_25: 'error'
}

function getQuartileLabel(quartile: QuartileLabel): string {
  return quartileLabelMap[quartile] ?? quartile
}

function getQuartileColor(quartile: QuartileLabel): string {
  return quartileColorMap[quartile] ?? 'grey'
}

async function loadRanking() {
  loading.value = true
  error.value = null
  try {
    quartiles.value = await getRankingByQuartiles()
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erro ao carregar ranking.'
    quartiles.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadRanking)
</script>

<template>
  <v-card class="pa-4 mb-6" elevation="2" max-height="565" style="overflow: auto;">
    <v-card-title class="text-h6 font-weight-bold">Ranking por quartis</v-card-title>
    <v-divider class="mb-2" />

    <div v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>

    <div v-else-if="error" class="text-center py-4 text-error text-body-2">
      {{ error }}
    </div>

    <template v-else>
      <div
        v-for="group in quartiles"
        :key="group.quartile"
        class="mb-4"
      >
        <div
          class="d-flex align-center mb-2 py-1 px-2 rounded"
          :class="`bg-${getQuartileColor(group.quartile)}`"
        >
          <span class="text-subtitle-2 font-weight-medium text-white">
            {{ getQuartileLabel(group.quartile) }}
          </span>
        </div>
        <v-list density="compact" class="py-0">
          <v-list-item
            v-for="item in group.users"
            :key="item.user.uuid"
            class="px-0"
          >
            <template #prepend>
              <v-avatar size="32" color="primary" class="mr-2">
                <span class="text-caption font-weight-bold text-white">
                  {{ getInitials(item.user.name) }}
                </span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2">
              {{ item.user.name }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ item.user.email }}
            </v-list-item-subtitle>
            <template #append>
              <v-chip size="small" :color="getQuartileColor(group.quartile)" variant="tonal">
                {{ item.average_rate_percentage.toFixed(1) }}%
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
        <div
          v-if="group.users.length === 0"
          class="text-caption text-medium-emphasis py-2"
        >
          Nenhum usuário neste quartil.
        </div>
      </div>
    </template>
  </v-card>
</template>
