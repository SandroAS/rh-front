<script setup lang="ts">
defineProps<{
  planName: string;
  totalPrice: number | null;
  priceLabel: string | null;
  planSlug: string;
  formatPrice: (value: number) => string;
}>();
</script>

<template>
  <div class="sticky-summary">
    <v-card class="checkout-summary-card pa-4" elevation="2" rounded="xl">
      <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-3">
        Resumo do pedido
      </h3>
      <v-divider class="mb-3" />
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-body-1 font-weight-medium text-grey-darken-3">{{ planName }}</span>
        <v-icon icon="mdi-check-circle" color="success" size="20" />
      </div>
      <template v-if="totalPrice != null && priceLabel">
        <p class="text-caption text-medium-emphasis mb-1">{{ priceLabel }}</p>
        <p class="text-h4 font-weight-black text-primary">
          {{ formatPrice(totalPrice) }}
        </p>
        <p class="text-caption text-grey mt-2">
          Pagamento seguro. Integração com gateway em breve.
        </p>
      </template>
      <template v-else>
        <p class="text-body-2 text-medium-emphasis">
          {{ planSlug === 'enterprise' ? 'Valor sob medida' : 'Selecione um plano' }}
        </p>
      </template>
      <v-divider class="my-3" />
      <div class="d-flex align-center gap-2 text-caption text-medium-emphasis">
        <v-icon icon="mdi-shield-lock-outline" size="18" />
        <span>Ambiente seguro</span>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.sticky-summary {
  position: sticky;
  top: 24px;
}

.checkout-summary-card {
  background: rgb(var(--v-theme-surface));
}
</style>
