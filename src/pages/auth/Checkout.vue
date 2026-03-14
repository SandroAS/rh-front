<script setup lang="ts">
import { useRouter } from 'vue-router';
import logoHorizontal from '@/assets/logo-horizontal.jpeg';
import CheckoutContent from '@/components/checkout/CheckoutContent.vue';

const router = useRouter();

function goBack() {
  router.push({ name: 'home' });
}

function onSubmit() {
  console.log('Checkout submit (placeholder)');
}
</script>

<template>
  <v-container class="checkout-page py-6" fluid>
    <div class="d-flex align-center mb-6">
      <router-link to="/" class="d-flex align-center text-decoration-none text-grey-darken-3 mr-4">
        <v-img
          :src="logoHorizontal"
          alt="Logo"
          contain
          height="36"
          max-width="140"
          eager
        />
      </router-link>
      <v-chip size="small" color="primary" variant="tonal">Checkout</v-chip>
      <v-spacer />
      <v-btn variant="text" color="grey-darken-2" class="text-none" @click="goBack">
        <v-icon start>mdi-arrow-left</v-icon>
        Voltar
      </v-btn>
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
