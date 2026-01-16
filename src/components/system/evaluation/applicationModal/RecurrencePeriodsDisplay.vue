<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  startedDate: Date | string | undefined;
  recurrence: string | undefined;
}>();

/**
 * Calcula os primeiros 5 períodos de recorrência baseados na data de início e tipo de recorrência
 */
const recurrencePeriods = computed(() => {
  if (!props.startedDate || !props.recurrence) {
    return [];
  }
  
  const startDate = new Date(props.startedDate);
  const periods = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < 5; i++) {
    const periodDate = new Date(currentDate);
    periods.push(periodDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }));
    
    // Avança para o próximo período baseado no tipo de recorrência
    switch (props.recurrence) {
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'bimonth':
        currentDate.setMonth(currentDate.getMonth() + 2);
        break;
      case 'quarter':
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'semester':
        currentDate.setMonth(currentDate.getMonth() + 6);
        break;
      case 'year':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }
  
  return periods;
});
</script>

<template>
  <v-alert v-if="recurrencePeriods && recurrencePeriods.length > 0" type="info" variant="tonal" density="compact">
    <div class="text-body-2">
      <strong>Períodos de recorrência:</strong>
      <div class="mt-1">
        {{ recurrencePeriods.join(', ') }}...
      </div>
    </div>
  </v-alert>
</template>
