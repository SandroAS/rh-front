<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  annotations: {
    tooth: number
    face?: string
    category: string
    note: string
    color: string
    createdAt: string | Date
  }[]
}>()

const emit = defineEmits<{
  (e: 'delete', index: number): void
}>()

function formatDate(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR')
}
</script>

<template>
  <v-card class="mt-6">
    <v-card-title>Histórico de Anotações</v-card-title>
    <v-data-table
      :items="annotations"
      class="elevation-1"
      :headers="[
        { title: 'Dente / Face', key: 'tooth' },
        { title: 'Categoria', key: 'category' },
        { title: 'Anotação', key: 'note' },
        { title: 'Data', key: 'createdAt' },
        { title: 'Ações', key: 'actions', sortable: false },
      ]"
      item-value="tooth"
      hide-default-footer
    >
      <template #item.tooth="{ item }">
        <span>{{ item.tooth }}<span v-if="item.face"> / {{ item.face }}</span></span>
      </template>

      <template #item.category="{ item }">
        <v-chip :color="item.color" text-color="white" size="small">
          {{ item.category }}
        </v-chip>
      </template>

      <template #item.createdAt="{ item }">
        <span>{{ formatDate(item.createdAt) }}</span>
      </template>

      <template #item.actions="{ index }">
        <v-btn icon @click="emit('delete', index)" color="red">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>
