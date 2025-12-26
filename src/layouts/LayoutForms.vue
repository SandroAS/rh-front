<script setup lang="ts">
import { useRouter } from 'vue-router';
import Toast from '@/components/system/Toast.vue';
import NavBarLogo from '@/components/system/navbar/NavBarLogo.vue'
import AvatarMenu from '@/components/system/navbar/AvatarMenu.vue'


const router = useRouter();

function goBack() {
  router.go(-1);
}
</script>

<template>
  <v-app-bar app dark height="40">
    <v-icon
      icon="mdi-arrow-left"
      class="ml-2"
      @click="goBack"
    />
    <NavBarLogo />

    <v-spacer />

    <AvatarMenu />

  </v-app-bar>

  <v-main class="bg-grey-lighten-4">
    <v-container fluid class="py-8">
      <router-view />
    </v-container>
  </v-main>

  <Toast />
</template>

<style scoped>
.v-main {
  min-height: 100vh;
}
</style>