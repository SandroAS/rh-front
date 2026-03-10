<script setup lang="ts">
import { watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { usePdiCategoryStore } from '@/stores/pdi-category.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type PdiCategory from '@/types/pdi/pdi-category.type';
import type PdiCategoryPayload from '@/types/pdi/pdi-category-payload.type';

const pdiCategoryStore = usePdiCategoryStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean;
  selectedPdiCategory?: PdiCategory | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved'): void;
}>();

const close = () => emit('update:modelValue', false);

const { handleSubmit, setValues, resetForm } = useForm({
  initialValues: {
    name: props.selectedPdiCategory?.name ?? '',
  },
  validationSchema: {
    name: 'required',
  },
});

const { value: name, errorMessage: nameError } = useField<string>('name', 'required');

watch(
  () => props.selectedPdiCategory,
  (val) => {
    setValues({
      name: val?.name ?? '',
    });
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      resetForm({
        values: { name: '' },
      });
    }
  }
);

const onSubmit = handleSubmit(async (formValues) => {
  const payload: PdiCategoryPayload = {
    name: (formValues.name ?? '').toString().trim(),
  };
  try {
    await pdiCategoryStore.savePdiCategory(payload, props.selectedPdiCategory?.uuid);
    snackbarStore.show(
      props.selectedPdiCategory?.uuid ? 'Categoria de PDI atualizada.' : 'Categoria de PDI criada.',
      'success'
    );
    emit('saved');
    close();
  } catch {
    snackbarStore.show(pdiCategoryStore.error ?? 'Falha ao salvar categoria de PDI.', 'error');
  }
});
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="500"
    persistent
    transition="dialog-transition"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ selectedPdiCategory?.uuid ? 'Editar Categoria de PDI' : 'Nova Categoria de PDI' }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          label="Nome da Categoria"
          variant="solo-filled"
          density="compact"
          hide-details="auto"
          :error="!!nameError"
          :error-messages="nameError"
          autofocus
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="pdiCategoryStore.loading" @click="onSubmit">
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
