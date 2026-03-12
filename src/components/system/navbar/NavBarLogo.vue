<script setup lang="ts">
import logoHorizontal from '@/assets/logo-horizontal.jpeg';
</script>

<template>
  <v-toolbar-title class="pl-2">
    <v-img
      :src="logoHorizontal"
      alt="Logo"
      contain
      height="32"
      max-width="140"
      class="d-block"
      eager
    />
  </v-toolbar-title>
</template>