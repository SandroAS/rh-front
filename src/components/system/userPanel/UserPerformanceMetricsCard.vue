<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useUserPanelStore } from '@/stores/user-panel.store';
import { getMetricTypeOption } from '@/types/drd/drd-metric.type';
import type { UserPanel, UserPanelDrdMetric } from '@/types/user/user-panel.type';
import type { UserMetricResponseDto } from '@/types/user/user-metric.type';
import { getUserMetricsByUserUuid } from '@/services/user-metric.service';
import UserMetricHistoryModal from './UserMetricHistoryModal.vue';

const userPanel = useUserPanelStore();

const props = defineProps<{
  user: UserPanel | null;
}>();

const emit = defineEmits<{ (e: 'saved'): void }>();

const historyModalOpen = ref(false);
const selectedMetric = ref<UserPanelDrdMetric | null>(null);
const userMetricsList = ref<UserMetricResponseDto[]>([]);
const userMetricsLoading = ref(false);

async function loadUserMetrics() {
  const uuid = props.user?.uuid;
  if (!uuid) {
    userMetricsList.value = [];
    return;
  }
  userMetricsLoading.value = true;
  try {
    userMetricsList.value = await getUserMetricsByUserUuid(uuid);
  } catch {
    userMetricsList.value = [];
  } finally {
    userMetricsLoading.value = false;
  }
}

/** Média dos valores da API para a métrica (drd_metric_uuid ou drdMetric.uuid). */
function getMetricAverage(metric: UserPanelDrdMetric): number | null {
  const metricUuid = metric.uuid;
  const items = userMetricsList.value.filter(
    (m) => m.drdMetric?.uuid === metricUuid
  );
  if (!items.length) return null;
  const sum = items.reduce((acc, m) => acc + Number(m.value), 0);
  return sum / items.length;
}

function openHistoryModal(metric: UserPanelDrdMetric) {
  selectedMetric.value = metric;
  historyModalOpen.value = true;
}

function onHistorySaved() {
  loadUserMetrics();
  emit('saved');
}

onMounted(() => loadUserMetrics());
watch(() => props.user?.uuid, () => loadUserMetrics());

/** Cargo completo do usuário (do plano de carreira), quando existir. */
const currentJobPosition = computed(() => {
  const currentJobUuid = props.user?.jobPosition?.uuid;
  if (!currentJobUuid) return null;
  return props.user?.careerPlan?.careerPlanJobPositions?.find(
    (item) => item.job_position_uuid === currentJobUuid || item.jobPosition?.uuid === currentJobUuid
  )?.jobPosition ?? null;
});

const currentDrd = computed(() => currentJobPosition.value?.drd);

const hasDrd = computed(() => !!currentDrd.value?.drdTopics?.length || !!currentDrd.value?.drdMetrics?.length);
</script>

<template>
  <v-card v-if="user" elevation="2" class="pa-4 overflow-hidden" style="height: 100%;">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-chart-donut</v-icon>
      Métricas de Desempenho
    </v-card-title>
    <v-divider class="mb-4" />

    <template v-if="!hasDrd">
      <div class="text-center text-medium-emphasis py-6">
        Nenhum DRD configurado para o cargo. Associe um plano de carreira ao cargo para ver métricas e médias.
      </div>
    </template>

    <template v-else>
      <!-- Métricas do DRD (como no UserCareerPlanCard) -->
      <div v-if="currentDrd?.drdMetrics?.length" class="mt-6">
        <v-row dense align="stretch">
          <v-col
            v-for="metric in currentDrd.drdMetrics"
            :key="metric.uuid"
            cols="12"
            sm="6"
            class="d-flex"
          >
            <v-card border rounded="lg" class="pa-4 transition-swing d-flex flex-column flex-grow-1">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <div class="text-caption text-disabled text-uppercase font-weight-bold" style="min-height: 40px;">{{ metric.name }}</div>
                  <div class="text-h4 font-weight-black my-1">
                    {{ getMetricAverage(metric) != null ? getMetricAverage(metric)!.toFixed(2) : '–' }}
                    <span class="text-subtitle-2 text-medium-emphasis">{{ getMetricTypeOption(metric.type)?.suffix }}</span>
                  </div>
                  <div v-if="metric.scoresByLevel?.[0]?.min_score != null" class="text-caption text-disabled">
                    Meta: {{ metric.scoresByLevel[0]?.min_score }}{{ getMetricTypeOption(metric.type)?.suffix }}
                  </div>
                </div>
                <v-icon
                  :icon="getMetricTypeOption(metric.type)?.icon ?? 'mdi-chart-box'"
                  :color="getMetricTypeOption(metric.type)?.color"
                  size="large"
                />
              </div>
              <div class="flex-grow-1 mt-2">
                <v-progress-linear
                  :indeterminate="userMetricsLoading"
                  :model-value="getMetricAverage(metric) != null && metric.scoresByLevel?.[0]?.min_score != null
                    ? Math.min(100, (getMetricAverage(metric)! / Number(metric.scoresByLevel[0]?.min_score)) * 100)
                    : 0"
                  height="4"
                  rounded
                  :color="getMetricTypeOption(metric.type)?.color"
                  :class="{ 'opacity-20': userMetricsLoading }"
                />
              </div>
              <div class="d-flex align-center justify-space-between mt-2">
                <span class="text-caption text-disabled">Meta para o nível alvo</span>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  density="compact"
                  class="text-none"
                  @click="openHistoryModal(metric)"
                >
                  <v-icon start size="small">mdi-plus</v-icon>
                  histórico
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </template>

    <UserMetricHistoryModal
      v-model="historyModalOpen"
      :user-uuid="user?.uuid ?? ''"
      :metric="selectedMetric"
      @saved="onHistorySaved"
    />
  </v-card>
</template>
