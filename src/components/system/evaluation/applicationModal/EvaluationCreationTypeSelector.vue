<script setup lang="ts">
import { computed } from 'vue';
import { Field } from '@/plugins/vee-validate';
import { useEvaluationStore } from '@/stores/evaluation.store';

const evaluationStore = useEvaluationStore();

const props = defineProps<{
  modelValue: 'AUTOMATIC' | 'SELECTED_EVALUATION';
  evaluationUuid: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: 'AUTOMATIC' | 'SELECTED_EVALUATION'];
  'update:evaluationUuid': [value: string];
}>();

const creationType = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const evaluationUuidModel = computed({
  get: () => props.evaluationUuid,
  set: (value) => emit('update:evaluationUuid', value)
});
</script>

<template>
  <v-radio-group v-model="creationType" hide-details>
    <div class="d-flex gap-2">
      <v-card
        variant="tonal"
        color="primary"
        class="pa-4 w-100 border-blue-custom"
      >
        <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
          <div style="white-space: normal;">Criar aplicações automaticamente</div>
          <div>
            <v-radio value="AUTOMATIC"></v-radio>
          </div>
        </v-card-title>
        <v-card-text class="pa-0">
          <p class="mb-3 text-caption">Criar automaticamente as aplicações com base nos cargos dos colaboradores de acordo com o modelo de avaliação vinculado aos respectivos descritivos de cargos.</p>
        </v-card-text>
      </v-card>
      <v-card
        variant="outlined"
        class="pa-4 w-100"
        :border="creationType === 'SELECTED_EVALUATION' ? 'primary md' : 'gray sm'"
      >
        <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
          <div style="white-space: normal;">Criar aplicações com base no modelo de avaliação selecionado</div>
          <div>
            <v-radio value="SELECTED_EVALUATION"></v-radio>
          </div>
        </v-card-title>
        <v-card-text class="pa-0">
          <p class="mb-3 text-caption">Selecione o modelo de avaliação que será usado para criar as aplicações.</p>
          <Field name="evaluation_uuid" label="Modelo de Avaliação" v-slot="{ field, errorMessage }">
            <v-select
              v-bind="field"
              v-model="evaluationUuidModel"
              :items="evaluationStore.evaluationOptions"
              :item-props="true"
              label="Modelo de Avaliação"
              variant="solo-filled"
              density="compact"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              :disabled="creationType === 'AUTOMATIC'"
              hide-details
            ></v-select>
          </Field>
        </v-card-text>
      </v-card>
    </div>
  </v-radio-group>
</template>
