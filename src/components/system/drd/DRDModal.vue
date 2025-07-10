<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useDRDStore } from '@/stores/drd.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type DRDPayload from '@/types/drd/drd-payload.type';
import type DRD from '@/types/drd/drd.type';
import { useJobPositionStore } from '@/stores/job-position.store';
import { useUserStore } from '@/stores/user.store';

const drdStore = useDRDStore();
const snackbarStore = useSnackbarStore();
const jobPositionStore = useJobPositionStore();
const userStore = useUserStore();

const props = defineProps<{
  modelValue: boolean,
  selectedDRD?: DRD | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

let drd = reactive<DRDPayload>({
  uuid: props.selectedDRD?.uuid || undefined,
  rate: props.selectedDRD?.rate || 0,
  jobPosition: props.selectedDRD?.jobPosition || undefined,
  drdTopics: props.selectedDRD?.drdTopics || undefined,
  drdMetrics: props.selectedDRD?.drdMetrics || undefined,
  createdByUser: userStore.currentUserSample
})

watch(() => props.selectedDRD, (val) => {
  drd = {
    rate: props.selectedDRD?.rate || 0,
    jobPosition: props.selectedDRD?.jobPosition || undefined,
    drdTopics: props.selectedDRD?.drdTopics || undefined,
    drdMetrics: props.selectedDRD?.drdMetrics || undefined,
    createdByUser: userStore.currentUserSample
  }
})

async function onSubmit(formValues: Record<string, any>) {
  const drd: DRDPayload = formValues as DRDPayload;

  try {
    await drdStore.saveDRD(drd, props.selectedDRD?.uuid);
    snackbarStore.show('Cargo salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(drdStore.error || 'Falha ao salvar cargo.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="drd">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedDRD ? 'Editar Cargo' : 'Novo Cargo' }}
        </v-card-title>
        <v-card-text>
          <Field name="jobPosition" label="Cargo" rules="required" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              label="cargo"
              :items="jobPositionStore.jobPositionsOptions"
              item-value="value"
              item-title="title"
              item-props="disabled"
              :return-object="false"
              variant="solo-filled"
              density="compact"
              persistent-placeholder
              :error="!!errorMessage"
              :error-messages="errorMessage"
            >
              <template v-slot:item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps" :title="item.title" :disabled="item.raw.disabled" />
              </template>
            </v-select>
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>