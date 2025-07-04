<script setup lang="ts">
import { computed } from 'vue'
import SideBarSchedule from '@/components/system/sidebar/SideBarSchedule.vue';

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
  { title: 'Pacientes', icon: 'mdi-account', to: '/system/pacientes' },
  { title: 'Orçamentos', icon: 'mdi-file-document-outline', to: '/system/orcamentos' },
  { title: 'Atendimentos', icon: 'mdi-account-heart', to: '/system/atendimentos' },
  { title: 'Agendamentos', icon: 'mdi-calendar-account', to: '/system/agendamentos' },
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

    <SideBarSchedule :rail="rail"/>
  </v-navigation-drawer>
</template>