<script setup lang="ts">
import type { BillingInterval } from '@/composables/useCheckoutPlan';

defineProps<{
  modelValue: BillingInterval;
  show: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: BillingInterval] }>();
</script>

<template>
  <div v-if="show" class="mb-6">
    <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">Recorrência</h3>
    <v-radio-group :model-value="modelValue" hide-details class="mt-0" @update:model-value="emit('update:modelValue', $event)">
      <div class="d-flex flex-wrap gap-3">
        <v-card
          :variant="modelValue === 'monthly' ? 'tonal' : 'elevated'"
          :color="modelValue === 'monthly' ? 'primary' : undefined"
          rounded="lg"
          class="cursor-pointer flex-grow-1"
          min-width="140"
          @click="emit('update:modelValue', 'monthly')"
        >
          <v-card-text class="d-flex align-center py-3">
            <v-radio value="monthly" hide-details class="mr-2" />
            <v-icon icon="mdi-calendar-month-outline" size="22" class="mr-2" />
            <span class="text-body-2 font-weight-medium">Mensal</span>
          </v-card-text>
        </v-card>
        <v-card
          :variant="modelValue === 'yearly' ? 'tonal' : 'elevated'"
          :color="modelValue === 'yearly' ? 'primary' : undefined"
          rounded="lg"
          class="cursor-pointer flex-grow-1"
          min-width="140"
          @click="emit('update:modelValue', 'yearly')"
        >
          <v-card-text class="d-flex align-center py-3">
            <v-radio value="yearly" hide-details class="mr-2" />
            <v-icon icon="mdi-calendar-check-outline" size="22" class="mr-2" />
            <span class="text-body-2 font-weight-medium">Anual</span>
            <v-chip size="x-small" color="success" class="ml-2" variant="flat">
              Economize
            </v-chip>
          </v-card-text>
        </v-card>
      </div>
    </v-radio-group>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
