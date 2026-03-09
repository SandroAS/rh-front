<script setup lang="ts">
import { computed } from 'vue';
import { useField } from 'vee-validate';

const props = defineProps<{
  index: number;
  canRemove: boolean;
}>();

defineEmits<{
  (e: 'remove'): void;
}>();

const dateName = computed(() => `intervals[${props.index}].date`);
const valueName = computed(() => `intervals[${props.index}].value`);

const { value: dateValue, errorMessage: dateError } = useField(dateName, 'required');
const { value: valueValue, errorMessage: valueError } = useField(valueName, 'required|numeric');
</script>

<template>
  <div class="d-flex align-center gap-2 mb-3">
    <v-text-field
      v-model="dateValue"
      label="Data"
      type="date"
      variant="outlined"
      density="compact"
      hide-details="auto"
      :error="!!dateError"
      :error-messages="dateError"
      class="flex-grow-1"
    />
    <v-text-field
      v-model="valueValue"
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
    <v-btn
      icon
      variant="text"
      size="small"
      color="error"
      :disabled="!canRemove"
      @click="$emit('remove')"
      title="Remover intervalo"
    >
      <v-icon>mdi-delete-outline</v-icon>
    </v-btn>
  </div>
</template>
