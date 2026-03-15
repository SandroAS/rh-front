<script setup lang="ts">
import { useRouter } from 'vue-router';
import CheckoutContent from '@/components/checkout/CheckoutContent.vue';

const router = useRouter();

function goBack() {
  router.back();
}

function onSubmit() {
  console.log('Checkout submit (placeholder)');
}
</script>

<template>
  <v-container class="checkout-page py-6" fluid>
    <div class="d-flex align-center mb-6">
      <v-btn
        variant="text"
        color="grey-darken-2"
        class="text-none"
        @click="goBack"
      >
        <v-icon start>mdi-arrow-left</v-icon>
        Voltar
      </v-btn>
      <v-spacer />
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
