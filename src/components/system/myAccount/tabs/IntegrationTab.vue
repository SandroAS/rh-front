<script setup>
import { ref } from 'vue'

const googleConnected = ref(false)

const conectarGoogleAgenda = () => {
  // Aqui você chamará sua rota de backend futuramente
  // que inicia o fluxo OAuth
  googleConnected.value = true
  console.log('Iniciando conexão com Google Agenda...')
}

const desconectarGoogleAgenda = () => {
  googleConnected.value = false
  console.log('Conta do Google desconectada')
}
</script>

<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="text-h6">Integração com Google Agenda</v-card-title>
    <v-card-text>
      <p>
        Conecte sua conta do Google para sincronizar seus compromissos com a Agenda Google.
      </p>

      <v-alert
        v-if="googleConnected"
        type="success"
        class="mb-4"
        border="start"
      >
        Conta conectada com sucesso!
      </v-alert>

      <v-alert
        v-else
        type="info"
        class="mb-4"
        border="start"
      >
        Nenhuma conta conectada.
      </v-alert>

      <v-btn
        v-if="!googleConnected"
        color="primary"
        @click="conectarGoogleAgenda"
      >
        Conectar com Google
      </v-btn>

      <v-btn
        v-else
        color="red"
        variant="tonal"
        @click="desconectarGoogleAgenda"
      >
        Desconectar
      </v-btn>
    </v-card-text>
  </v-card>
</template>
