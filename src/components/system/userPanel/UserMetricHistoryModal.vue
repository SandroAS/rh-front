<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm, useFieldArray } from 'vee-validate';
import { useSnackbarStore } from '@/stores/snackbar.store';
import UserMetricIntervalRow from './UserMetricIntervalRow.vue';
import { getUserMetricsByUserUuid, saveUserMetrics } from '@/services/user-metric.service';
import type { UserPanelDrdMetric } from '@/types/user/user-panel.type';

const snackbarStore = useSnackbarStore();

interface IntervalRow {
  date: string;
  value: string | number;
  uuid?: string;
}

function getDefaultRow(): IntervalRow {
  const today = new Date().toISOString().slice(0, 10);
  return { date: today, value: '' };
}

const props = defineProps<{
  modelValue: boolean;
  userUuid: string;
  metric: UserPanelDrdMetric | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const loading = ref(false);
const loadingIntervals = ref(false);

const { handleSubmit } = useForm({
  initialValues: {
    intervals: [getDefaultRow()] as IntervalRow[],
  },
});

const { fields, push, remove, replace } = useFieldArray<IntervalRow>('intervals');

function close() {
  emit('update:modelValue', false);
}

function addInterval() {
  push(getDefaultRow());
}

function removeInterval(index: number) {
  if (fields.value.length <= 1) return;
  remove(index);
}

async function loadExistingIntervals() {
  if (!props.userUuid || !props.metric?.uuid) {
    replace([getDefaultRow()]);
    return;
  }
  loadingIntervals.value = true;
  try {
    const list = await getUserMetricsByUserUuid(props.userUuid);
    const metricUuid = props.metric.uuid;
    const forThisMetric = list.filter((m) => m.drdMetric?.uuid === metricUuid);
    const rows: IntervalRow[] = forThisMetric.length
      ? forThisMetric.map((m) => ({
          date: typeof m.date === 'string' ? m.date.slice(0, 10) : new Date(m.date).toISOString().slice(0, 10),
          value: Number(m.value),
          uuid: m.uuid,
        }))
      : [getDefaultRow()];
    replace(rows);
  } catch {
    replace([getDefaultRow()]);
  } finally {
    loadingIntervals.value = false;
  }
}

watch(
  () => [props.modelValue, props.metric?.uuid] as const,
  ([open]) => {
    if (open) {
      loadExistingIntervals();
    }
  }
);

const onSubmit = handleSubmit(async (values) => {
  if (!props.userUuid || !props.metric?.uuid) return;
  const intervalsList = values.intervals as IntervalRow[];
  const intervals: { date: string; value: number; uuid?: string }[] = [];
  for (const row of intervalsList) {
    const dateStr = (row?.date ?? '').toString().trim();
    const numVal = Number(row?.value);
    if (!dateStr || isNaN(numVal)) continue;
    intervals.push({ date: dateStr, value: numVal, uuid: row.uuid });
  }
  if (intervals.length === 0) {
    snackbarStore.show('Preencha pelo menos um intervalo com data e valor válidos.', 'error');
    return;
  }
  loading.value = true;
  try {
    await saveUserMetrics({
      user_uuid: props.userUuid,
      drd_metric_uuid: props.metric.uuid,
      intervals,
    });
    snackbarStore.show(
      intervals.length === 1 ? 'Registro de métrica salvo.' : `${intervals.length} registros de métrica salvos.`,
      'success'
    );
    emit('saved');
    close();
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    snackbarStore.show(msg ?? 'Erro ao salvar registro.', 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="520"
    persistent
    transition="dialog-transition"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-chart-line-variant</v-icon>
        Registrar histórico
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text class="pt-4">
        <p v-if="metric" class="text-body-2 text-medium-emphasis mb-4">
          Métrica: <strong>{{ metric.name }}</strong>
        </p>
        <v-progress-linear v-if="loadingIntervals" indeterminate color="primary" class="mb-4" />
        <UserMetricIntervalRow
          v-for="(field, index) in fields"
          :key="field.key"
          :index="index"
          :can-remove="fields.length > 1"
          @remove="removeInterval(index)"
        />
        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          class="mt-2"
          block
          @click="addInterval"
        >
          <v-icon start size="small">mdi-plus</v-icon>
          Adicionar intervalo
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="loading">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="onSubmit">Salvar todos</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
