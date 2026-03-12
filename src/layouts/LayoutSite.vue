<script lang="ts" setup>
const logoHorizontal = '/logo-horizontal.jpeg';
</script>

<template>
  <v-app-bar color="white" elevation="1" style="position: fixed;">
    <div class="d-flex align-center justify-space-between w-100 px-4">
      <a href="#home" class="text-decoration-none d-flex align-center">
        <v-img
          :src="logoHorizontal"
          alt="Logo"
          contain
          height="40"
          max-width="160"
        />
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