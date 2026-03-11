<script setup lang="ts">
import { computed } from 'vue';
import { useField } from 'vee-validate';
import { usePdiCategoryStore } from '@/stores/pdi-category.store';

const props = defineProps<{
  index: number;
  canRemove: boolean;
}>();

defineEmits<{
  (e: 'remove'): void;
}>();

const pdiCategoryStore = usePdiCategoryStore();

const { value: title, errorMessage: titleError } = useField(
  computed(() => `pdi_goals[${props.index}].title`),
  'required'
);
const { value: description } = useField(computed(() => `pdi_goals[${props.index}].description`));
const { value: pdiCategoryUuid } = useField(computed(() => `pdi_goals[${props.index}].pdi_category_uuid`));
const { value: startDate } = useField(computed(() => `pdi_goals[${props.index}].start_date`));
const { value: endDate } = useField(computed(() => `pdi_goals[${props.index}].end_date`));

const categoryOptions = computed(() => pdiCategoryStore.allPdiCategoryOptions ?? []);
</script>

<template>
  <v-card variant="elevated" class="mb-4">
    <v-card-title class="d-flex align-center text-body-1 py-3">
      Objetivo #{{ index + 1 }}
      <v-spacer />
      <v-btn
        icon
        variant="text"
        size="small"
        color="error"
        :disabled="!canRemove"
        title="Remover objetivo"
        @click="$emit('remove')"
      >
        <v-icon>mdi-delete-outline</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-text-field
        v-model="title"
        label="Título"
        variant="solo-filled"
        density="compact"
        hide-details="auto"
        :error="!!titleError"
        :error-messages="titleError"
        class="mb-3"
      />
      <v-textarea
        v-model="description"
        label="Descrição"
        variant="solo-filled"
        density="compact"
        hide-details="auto"
        rows="3"
        class="mb-3"
      />
      <v-select
        v-model="pdiCategoryUuid"
        :items="categoryOptions"
        item-title="title"
        item-value="value"
        label="Categoria de PDI (opcional)"
        variant="solo-filled"
        density="compact"
        hide-details="auto"
        clearable
        class="mb-3"
      />
      <div class="d-flex gap-3 flex-wrap">
        <v-text-field
          v-model="startDate"
          label="Data de início"
          type="date"
          variant="solo-filled"
          density="compact"
          hide-details="auto"
          class="flex-grow-1"
          style="min-width: 140px;"
        />
        <v-text-field
          v-model="endDate"
          label="Data de fim"
          type="date"
          variant="solo-filled"
          density="compact"
          hide-details="auto"
          class="flex-grow-1"
          style="min-width: 140px;"
        />
      </div>
    </v-card-text>
  </v-card>
</template>
