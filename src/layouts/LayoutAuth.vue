<script setup lang="ts">
import Toast from '@/components/system/Toast.vue';

</script>

<template>
  <v-main class="d-flex justify-center align-center bg-primary" style="min-height: 100vh;">
    <router-view />
  </v-main>

  <Toast />
</template>

<style scoped>
.v-main {
  background: radial-gradient(circle, rgb(74, 175, 244, 1) 32%, rgb(74, 78, 244, 1) 100%);
}
</style>