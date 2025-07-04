<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { OdontogramaCategoryType, useOdontogramaCategoryStore } from '@/stores/odontograma-category.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type OdontogramaCategoryPayload from '@/types/odontogramaCategory/odontograma-category-payload.type';
import type OdontogramaCategory from '@/types/odontogramaCategory/odontograma-category.type';

const odontogramaCategoryStore = useOdontogramaCategoryStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean,
  selectedOdontogramaCategory?: OdontogramaCategory | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

let service = reactive<OdontogramaCategoryPayload>({
  uuid: props.selectedOdontogramaCategory?.name || undefined,
  name: props.selectedOdontogramaCategory?.name || '',
  color: props.selectedOdontogramaCategory?.color || '',
  type: props.selectedOdontogramaCategory?.type || undefined
})

watch(() => props.selectedOdontogramaCategory, (val) => {
  service = {
    uuid: props.selectedOdontogramaCategory?.name || undefined,
    name: props.selectedOdontogramaCategory?.name || '',
    color: props.selectedOdontogramaCategory?.color || '',
    type: props.selectedOdontogramaCategory?.type || undefined
  }
})

async function onSubmit(formValues: Record<string, any>) {
  const odontogramaCategory: OdontogramaCategoryPayload = formValues as OdontogramaCategoryPayload;

  try {
    await odontogramaCategoryStore.saveOdontogramaCategory(odontogramaCategory, props.selectedOdontogramaCategory?.uuid);
    snackbarStore.show('Serviço salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(odontogramaCategoryStore.error || 'Falha ao salvar serviço.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="service">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedOdontogramaCategory ? 'Editar Categoria de Odontograma' : 'Nova Categoria de Odontograma' }}
        </v-card-title>
        <v-card-text>
          <Field name="name" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome"
              required
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedOdontogramaCategory?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="color" rules="required" v-slot="{ field, errorMessage }">
            <v-color-picker
              v-bind="field"
              mode="hexa"
              label="Cor"
              hide-canvas
              show-swatches
              flat
              style="width: -webkit-fill-available"
              :persistent-placeholder="!!props.selectedOdontogramaCategory?.color"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>
          <Field name="type" rules="required" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              label="Tipo"
              :items="[{title: 'Dente', value: 'TOOTH'},{title: 'Face', value: 'Face'}]"
              item-value="value"
              item-title="title"
              :return-object="false"
              variant="solo-filled"
              density="compact"
              persistent-placeholder
              :error="!!errorMessage"
              :error-messages="errorMessage"
            />
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