<script setup lang="ts">
import { computed } from 'vue'
import SideBarMyTeam from './SideBarMyTeam.vue';

const props = defineProps<{
  isMobile: boolean
  modelValue: boolean
  rail: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const drawer = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/system/dashboard' },
  { title: 'DRDs', icon: 'mdi-account', to: '/system/drds' },
  { title: 'Planos de Carreira', icon: 'mdi-file-document-outline', to: '/system/career-plans' },
  { title: 'Avaliações', icon: 'mdi-account-heart', to: '/system/evaluation' },
  { title: 'PDIs', icon: 'mdi-calendar-account', to: '/system/pdis' },
]
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    :permanent="!isMobile"
    :temporary="isMobile"
    :app="isMobile"
    :rail="!isMobile ? rail : false"
    width="240"
    class="d-flex flex-column justify-space-between"
    aria-label="Menu lateral"
    active-class="bg-blue-grey-lighten-4 text-primary"
  >
    <v-list nav density="comfortable" class="flex-grow-1 overflow-y-auto">
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        router
        @click="isMobile && emit('update:modelValue', false)"
      >
        <template #prepend>
          <v-icon class="mr-2">{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <SideBarMyTeam :rail="rail"/>
  </v-navigation-drawer>
</template>