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

const isTopQuartile = (quartile: QuartileLabel) => quartile === 'top_25'

/** Medal/position for first 3 in top 25%: 1-based index → emoji. */
function getPositionEmoji(quartile: QuartileLabel, index: number): string | null {
  if (quartile !== 'top_25' || index > 2) return null
  const medals = ['🥇', '🥈', '🥉']
  return medals[index] ?? null
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
        :class="{ 'top-quartile-block': isTopQuartile(group.quartile) }"
      >
        <div
          class="d-flex align-center mb-2 py-1 px-2 rounded quartile-header"
          :class="[`bg-${getQuartileColor(group.quartile)}`, { 'top-quartile-header': isTopQuartile(group.quartile) }]"
        >
          <span v-if="isTopQuartile(group.quartile)" class="trophy-icon mr-2" aria-hidden="true">🏆</span>
          <span class="text-subtitle-2 font-weight-medium text-white">
            {{ getQuartileLabel(group.quartile) }}
          </span>
        </div>
        <v-list density="compact" class="py-0">
          <v-list-item
            v-for="(item, index) in group.users"
            :key="item.user.uuid"
            class="px-0"
            :class="{ 'top-quartile-item': isTopQuartile(group.quartile) }"
          >
            <template #prepend>
              <span v-if="getPositionEmoji(group.quartile, index)" class="position-emoji mr-2">
                {{ getPositionEmoji(group.quartile, index) }}
              </span>
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

<style scoped>
.trophy-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.position-emoji {
  font-size: 1.25rem;
  line-height: 1;
  min-width: 1.5rem;
  text-align: center;
}

.top-quartile-block {
  background: linear-gradient(135deg, rgba(var(--v-theme-success), 0.08) 0%, transparent 50%);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

.top-quartile-header {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.top-quartile-item {
  border-radius: 6px;
}
</style>
