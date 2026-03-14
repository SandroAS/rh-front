<script setup lang="ts">
import { useRouter } from 'vue-router';
import CheckoutContent from '@/components/checkout/CheckoutContent.vue';

const router = useRouter();

function onSubmit() {
  console.log('Checkout submit (placeholder)');
}

function goBack() {
  router.push({ name: 'home' });
}
</script>

<template>
  <v-container class="checkout-page py-8" fluid>
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-3">
      <v-btn
        variant="text"
        color="grey-darken-2"
        class="text-none"
        @click="goBack"
      >
        <v-icon start>mdi-arrow-left</v-icon>
        Voltar
      </v-btn>
      <v-chip size="small" color="primary" variant="tonal">Checkout</v-chip>
    </div>

    <CheckoutContent @submit="onSubmit" />
  </v-container>
</template>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
