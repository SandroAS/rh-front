<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useJobPositionStore } from '@/stores/job-position.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type Service from '@/types/jobPosition/job-position.type';
import type ServicePayload from '@/types/jobPosition/job-position-payload.type';
import { useSystemModuleStore } from '@/stores/system-module.store';

const jobPositionStore = useJobPositionStore();
const snackbarStore = useSnackbarStore();
const levelsGroupStore = useSystemModuleStore()

const props = defineProps<{
  modelValue: boolean,
  selectedJobPosition?: Service | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

let service = reactive<ServicePayload>({
  uuid: props.selectedJobPosition?.uuid || undefined,
  name: props.selectedJobPosition?.name || '',
  description: props.selectedJobPosition?.description || '',
  levelsGroup: props.selectedJobPosition?.levelsGroup || undefined
})

watch(() => props.selectedJobPosition, (val) => {
  service = {
    name: props.selectedJobPosition?.name || '',
    description: props.selectedJobPosition?.description || '',
    levelsGroup: props.selectedJobPosition?.levelsGroup || undefined
  }
})

async function onSubmit(formValues: Record<string, any>) {
  const service: ServicePayload = formValues as ServicePayload;

  try {
    await jobPositionStore.saveJobPosition(service, props.selectedJobPosition?.uuid);
    snackbarStore.show('Serviço salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(jobPositionStore.error || 'Falha ao salvar serviço.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="service">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedJobPosition ? 'Editar Serviço' : 'Novo Serviço' }}
        </v-card-title>
        <v-card-text>
          <Field name="name" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedJobPosition?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="description" rules="required" v-slot="{ field, errorMessage }">
            <v-textarea
              v-bind="field"
              label="Descrição"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedJobPosition?.description"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="systemModule" rules="required" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              label="Módulo do Sistema"
              :items="levelsGroupStore.systemModulesOptions"
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