<script lang="ts" setup>
import logo from '@/assets/logo.png'
</script>

<template>
  <v-app-bar color="white" elevation="1" style="position: fixed;">
    <div class="d-flex align-center justify-space-between w-100 px-4">
      <a href="#home" class="text-decoration-none">
        <div class="d-flex align-center">
          <v-img :src="logo" alt="Logo RH" contain height="40" width="120" class="mr-4" />


          <span class="text-primary font-weight-bold text-h5">RH</span>
        </div>
      </a>

      <div class="d-none d-md-flex align-center">
        <v-btn variant="text" href="#resources">Recursos</v-btn>
        <v-btn variant="text" href="#plans">Planos</v-btn>
        <v-btn variant="text" href="#contacts">Contatos</v-btn>
        <v-btn color="primary" class="ml-4" rounded="lg" to="/auth/login">
          Acessar Sistema
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <v-app-bar-nav-icon class="d-flex d-md-none"></v-app-bar-nav-icon>
    </div>
  </v-app-bar>

  <v-main>
    <router-view></router-view>
  </v-main>
</template>

<style>
.v-application {
  font-family: 'Inter', sans-serif !important;
}

html {
  scroll-behavior: smooth;
}
</style>