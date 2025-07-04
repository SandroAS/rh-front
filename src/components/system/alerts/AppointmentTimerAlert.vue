<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  isMobile: boolean
}>()

// Atendimento em andamento
const isAttending = ref(false)
const elapsedSeconds = ref(0)
let timer: number | null = null

const formattedTime = computed(() => {
  const hours = String(Math.floor(elapsedSeconds.value / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((elapsedSeconds.value % 3600) / 60)).padStart(2, '0')
  const seconds = String(elapsedSeconds.value % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
})

const startTimer = () => {
  if (!timer) {
    timer = setInterval(() => elapsedSeconds.value++, 1000)
  }
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const finalizeAtendimento = () => {
  stopTimer()
  isAttending.value = false
}

// Modal de anotações
const showModal = ref(false)
const anotacoes = ref('')

onMounted(() => {
  if (isAttending.value) startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div v-if="isAttending" class="v-toolbar bg-white">
    <v-alert type="info" border="bottom" class="w-100 rounded-0" variant="tonal">
      <div class="d-flex align-center justify-space-between flex-wrap" :class="{ 'flex-column': isMobile }">
        <span class="mb-2" v-if="isMobile">Atendimento em andamento - Tempo decorrido: <strong>{{ formattedTime }}</strong></span>
        <span v-else>Atendimento em andamento - Tempo decorrido: <strong>{{ formattedTime }}</strong></span>

        <div :class="isMobile ? 'w-100 d-flex flex-column' : 'ml-4 d-flex'">
          <v-btn color="info" variant="flat" class="mb-2 mb-md-0 mr-md-2" @click="finalizeAtendimento">
            Finalizar Atendimento
          </v-btn>
          <v-btn color="primary" variant="outlined" class="" @click="showModal = true">
            Anotações
          </v-btn>
        </div>
      </div>
    </v-alert>
  </div>

  <v-dialog v-model="showModal" max-width="500px">
    <v-card>
      <v-card-title>Anotações do Atendimento</v-card-title>
      <v-card-text>
        <v-textarea v-model="anotacoes" label="Escreva suas anotações..." auto-grow rows="4" variant="solo-filled" density="comfortable" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="showModal = false">Fechar</v-btn>
        <v-btn color="primary" @click="showModal = false">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>