<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store'
import { getInitials } from '@/utils/getInitialsFromName.util'

const evaluationApplicationStore = useEvaluationApplicationStore()

const pendingByEvaluator = computed(() => {
  const data = evaluationApplicationStore.pending_by_evaluator
  if (!data || !Array.isArray(data)) return []
  return data.filter(item => item.pending_applications?.length > 0)
})

function formatExpirationDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getFormLink(uuid: string): string {
  const base = typeof window !== 'undefined' ? `${window.location.origin}` : ''
  return `${base}/forms/avaliacao/${uuid}`
}

async function copyFormLink(uuid: string) {
  const url = getFormLink(uuid)
  try {
    await navigator.clipboard.writeText(url)
    // opcional: snackbar de sucesso
  } catch {
    // fallback
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
}

onMounted(async () => {
  if (!evaluationApplicationStore.pending_by_evaluator) {
    await evaluationApplicationStore.getPendingByEvaluator()
  }
})
</script>

<template>
  <v-card class="pa-4 mb-6" elevation="2" max-height="565" style="overflow: auto;">
    <v-card-title class="text-h6 font-weight-bold">Avaliações Pendentes</v-card-title>
    <v-divider class="mb-2" />

    <v-expansion-panels variant="accordion">
      <v-expansion-panel
        v-for="item in pendingByEvaluator"
        :key="item.evaluator.uuid"
        class="py-0"
      >
        <v-expansion-panel-title class="py-2">
          <template #default="{ expanded }">
            <div class="d-flex align-center flex-grow-1">
              <v-avatar color="primary" size="40" class="mr-3">
                <span class="text-white text-subtitle-2">
                  {{ getInitials(item.evaluator.name) }}
                </span>
              </v-avatar>
              <div class="flex-grow-1 min-width-0">
                <div class="font-weight-medium text-body-2">
                  {{ item.evaluator.name }}
                </div>
                <div class="text-caption text-medium-emphasis truncate">
                  {{ item.evaluator.email }}
                </div>
              </div>
              <v-chip
                color="warning"
                variant="tonal"
                size="small"
                class="ml-2"
              >
                {{ item.pending_applications.length }} pendente<span v-if="item.pending_applications.length > 1">s</span>
              </v-chip>
            </div>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list density="compact" class="pt-0">
            <v-list-item
              v-for="app in item.pending_applications"
              :key="app.uuid"
              class="px-0 pb-2"
            >
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ app.name }}
              </v-list-item-title>
              <div class="d-flex justify-space-between align-center">
                <v-list-item-subtitle class="text-caption">
                  Avaliado: {{ app.evaluated_user?.name ?? '—' }}
                  <span v-if="app.expiration_date" class="ml-2">
                    · Data limite: {{ formatExpirationDate(app.expiration_date) }}
                  </span>
                </v-list-item-subtitle>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  density="default"
                  @click="copyFormLink(app.uuid)"
                >
                  <v-icon size="small" class="mr-1">mdi-content-copy</v-icon>
                  Copiar link
                </v-btn>
              </div>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-if="pendingByEvaluator.length === 0 && !evaluationApplicationStore.loading" class="text-center text-body-2 mt-4">
      Nenhum colaborador com avaliações pendentes.
    </div>
    <div v-if="evaluationApplicationStore.loading" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>
  </v-card>
</template>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
