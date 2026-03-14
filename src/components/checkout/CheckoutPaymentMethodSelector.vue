<script setup lang="ts">
export type PaymentMethod = 'pix' | 'card' | 'boleto';

const options: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'pix', label: 'PIX', icon: 'mdi-qrcode' },
  { value: 'card', label: 'Cartão de crédito', icon: 'mdi-credit-card-outline' },
  { value: 'boleto', label: 'Boleto', icon: 'mdi-barcode' },
];

defineProps<{
  modelValue: PaymentMethod;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: PaymentMethod] }>();
</script>

<template>
  <div class="mb-6">
    <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
      Forma de pagamento
    </h3>
    <v-radio-group :model-value="modelValue" hide-details class="mt-0" @update:model-value="emit('update:modelValue', $event)">
      <div class="d-flex flex-wrap gap-3">
        <v-card
          v-for="opt in options"
          :key="opt.value"
          :variant="modelValue === opt.value ? 'tonal' : 'elevated'"
          :color="modelValue === opt.value ? 'primary' : undefined"
          rounded="lg"
          class="cursor-pointer flex-grow-1"
          min-width="140"
          @click="emit('update:modelValue', opt.value)"
        >
          <v-card-text class="d-flex align-center py-3">
            <v-radio :value="opt.value" hide-details class="mr-2" />
            <v-icon :icon="opt.icon" size="22" class="mr-2" />
            <span class="text-body-2 font-weight-medium">{{ opt.label }}</span>
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
