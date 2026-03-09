<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm, useFieldArray } from 'vee-validate';
import { Field } from '@/plugins/vee-validate';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { saveUserMetrics } from '@/services/user-metric.service';
import type { UserPanelDrdMetric } from '@/types/user/user-panel.type';

const snackbarStore = useSnackbarStore();

function getDefaultRow() {
  const today = new Date().toISOString().slice(0, 10);
  return { date: today, value: '' as string | number };
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

const { handleSubmit } = useForm({
  initialValues: {
    intervals: [getDefaultRow()],
  },
});

const { fields, push, remove, replace } = useFieldArray<{ date: string; value: string | number }>('intervals');

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

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      replace([getDefaultRow()]);
    }
  }
);

const onSubmit = handleSubmit(async (values) => {
  if (!props.userUuid || !props.metric?.uuid) return;
  const intervalsList = values.intervals as { date: string; value: string | number }[];
  const intervals: { date: string; value: number }[] = [];
  for (const row of intervalsList) {
    const dateStr = (row?.date ?? '').toString().trim();
    const numVal = Number(row?.value);
    if (!dateStr || isNaN(numVal)) continue;
    intervals.push({ date: dateStr, value: numVal });
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
        <div
          v-for="(field, index) in fields"
          :key="field.key"
          class="d-flex align-center gap-2 mb-3"
        >
          <Field
            :name="`intervals[${index}].date`"
            rules="required"
            v-slot="{ field: dateField, errorMessage: dateError }"
          >
            <v-text-field
              v-bind="dateField"
              label="Data"
              type="date"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :error="!!dateError"
              :error-messages="dateError"
              class="flex-grow-1"
            />
          </Field>
          <Field
            :name="`intervals[${index}].value`"
            rules="required|numeric"
            v-slot="{ field: valueField, errorMessage: valueError }"
          >
            <v-text-field
              v-bind="valueField"
              label="Valor"
              type="number"
              variant="outlined"
              density="compact"
              hide-details="auto"
              step="any"
              min="0"
              class="flex-grow-1"
              style="max-width: 120px;"
              :error="!!valueError"
              :error-messages="valueError"
            />
          </Field>
          <v-btn
            icon
            variant="text"
            size="small"
            color="error"
            :disabled="fields.length <= 1"
            @click="removeInterval(index)"
            title="Remover intervalo"
          >
            <v-icon>mdi-delete-outline</v-icon>
          </v-btn>
        </div>
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
