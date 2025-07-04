<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar.store'

const snackbar = useSnackbarStore()
const visibleToasts = ref<any[]>([])

const MAX_VISIBLE = 5
const DURATION = 4000
const TOAST_GAP = 62

watch(
  () => snackbar.messages,
  () => {
    processQueue()
  },
  { deep: true }
)

function processQueue() {
  while (
    visibleToasts.value.length < MAX_VISIBLE &&
    snackbar.messages.length > 0
  ) {
    const next = snackbar.messages.shift()
    if (next) {
      next.active = true
      visibleToasts.value.push(next)

      setTimeout(() => closeToast(next.id), DURATION)
    }
  }
}

function closeToast(id: string | number) {
  const index = visibleToasts.value.findIndex((msg) => msg.id === id)
  if (index !== -1) {
    visibleToasts.value[index].active = false
    setTimeout(() => {
      visibleToasts.value.splice(index, 1)
      processQueue()
    }, 300)
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'info': default: return 'mdi-information'
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 w-[350px] pointer-events-none">
    <transition-group name="toast-fade" tag="div">
      <v-snackbar
        v-for="(toast, index) in visibleToasts"
        :key="toast.id"
        v-model="toast.active"
        :color="toast.color"
        location="top end"
        elevation="3"
        class="rounded w-full pointer-events-auto transition-all duration-300"
        :style="{ marginTop: `${index * TOAST_GAP}px` }"
      >
        <div class="d-flex items-center justify-between w-full gap-2">
          <!-- Ícone -->
          <v-icon start size="20" class="mr-1 text-white">
            {{ getIcon(toast.type) }}
          </v-icon>

          <!-- Mensagem -->
          <div class="text-sm font-medium flex-1 truncate text-white">
            {{ toast.text }}
          </div>

          <!-- Botão fechar -->
          <v-icon
            size="20"
            class="cursor-pointer ml-2 text-white"
            @click="closeToast(toast.id)"
          >
            mdi-close
          </v-icon>
        </div>
      </v-snackbar>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-fade-move,
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
</style>
