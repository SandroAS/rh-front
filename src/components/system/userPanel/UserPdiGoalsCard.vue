<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { usePdiStore } from '@/stores/pdi.store';
import type Pdi from '@/types/pdi/pdi.type';
import type PdiGoal from '@/types/pdi/pdi-goal.type';
import { PdiStatus } from '@/types/pdi/pdi.type';
import type { UserPanel } from '@/types/user/user-panel.type';
import { formatDate } from '@/utils/formatDate.util';

const props = defineProps<{
  user: UserPanel | null;
}>();

const PDI_STATUS_LABELS: Record<string, string> = {
  [PdiStatus.NOT_STARTED]: 'Não iniciado',
  [PdiStatus.IN_PROGRESS]: 'Em progresso',
  [PdiStatus.PARTIALLY_COMPLETED]: 'Parcialmente concluído',
  [PdiStatus.COMPLETED]: 'Concluído',
  [PdiStatus.CANCELLED]: 'Cancelado',
};

const PDI_STATUS_COLORS: Record<string, string> = {
  [PdiStatus.NOT_STARTED]: 'grey',
  [PdiStatus.IN_PROGRESS]: 'warning',
  [PdiStatus.PARTIALLY_COMPLETED]: 'info',
  [PdiStatus.COMPLETED]: 'success',
  [PdiStatus.CANCELLED]: 'error',
};

function getStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return PDI_STATUS_LABELS[status] ?? status;
}

function getStatusColor(status: string | null | undefined): string {
  if (!status) return 'grey';
  return PDI_STATUS_COLORS[status] ?? 'grey';
}

const pdiStore = usePdiStore();
const pdis = ref<Pdi[]>([]);
const loading = ref(false);

const goalsInProgress = computed(() => {
  const list: PdiGoal[] = [];
  for (const pdi of pdis.value) {
    const goals = pdi.pdi_goals ?? pdi.goals ?? [];
    for (const g of goals) {
      if (g.status === PdiStatus.IN_PROGRESS) list.push(g);
    }
  }
  return list;
});

async function loadPdis() {
  const uuid = props.user?.uuid;
  if (!uuid) {
    pdis.value = [];
    return;
  }
  loading.value = true;
  try {
    pdis.value = await pdiStore.getPdisByUserUuid(uuid);
  } catch {
    pdis.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => loadPdis());
watch(() => props.user?.uuid, () => loadPdis());
</script>

<template>
  <v-card v-if="user" elevation="2" class="pa-4 overflow-hidden" style="height: 100%;">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-target</v-icon>
      PDIs em andamento
    </v-card-title>
    <v-divider class="mb-4" />

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-else-if="!goalsInProgress.length">
      <div class="text-center text-medium-emphasis py-8">
        Nenhum PDI ativo no momento para esse usuário.
      </div>
    </template>

    <template v-else>
      <v-row dense align="stretch">
        <v-col
          v-for="(goal, index) in goalsInProgress"
          :key="goal.uuid ?? index"
          cols="12"
          sm="6"
          md="4"
          class="d-flex"
        >
          <v-card variant="outlined" class="pa-4 d-flex flex-column flex-grow-1">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-subtitle-2 font-weight-bold">{{ goal.title || 'Objetivo' }}</span>
              <v-chip
                v-if="goal.status"
                :color="getStatusColor(goal.status)"
                size="small"
                variant="flat"
              >
                {{ getStatusLabel(goal.status) }}
              </v-chip>
            </div>
            <v-card-text class="pt-0 px-0 flex-grow-1">
              <p v-if="goal.description" class="text-body-2 text-medium-emphasis mb-3">
                {{ goal.description }}
              </p>
              <p v-else class="text-body-2 text-disabled mb-3">Sem descrição.</p>
              <div v-if="goal.pdi_category?.name" class="text-caption text-disabled mb-2">
                Categoria: {{ goal.pdi_category.name }}
              </div>
              <div class="d-flex gap-3 flex-wrap text-caption text-disabled">
                <span v-if="goal.start_date">
                  Início: {{ formatDate(goal.start_date) }}
                </span>
                <span v-if="goal.end_date">
                  Fim: {{ formatDate(goal.end_date) }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>
