<script setup lang="ts">
import { useUserStore } from '@/stores/auth.store'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const nomeUsuario = useUserStore().userName
const emailUsuario = useUserStore().userEmail

const siglaUsuario = computed(() => {
  if(!nomeUsuario) return '??'
  const nomes = nomeUsuario.trim().split(' ')
  if (nomes.length === 1) return nomes[0][0].toUpperCase()
  return `${nomes[0][0]}${nomes[nomes.length - 1][0]}`.toUpperCase()
})

function irPara(path: string) {
  router.push(path)
}
</script>

<template>
  <v-menu offset-y :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        class="ml-2 elevation-4 bg-white"
        variant="text"
        icon
        size="x-small"
      >
        <v-avatar size="36">
          <span class="text-primary text-subtitle-2 mb-1">{{ siglaUsuario }}</span>
        </v-avatar>
      </v-btn>
    </template>

    <v-list density="compact">
      <v-list-item class="mb-1">
        <template #prepend>
          <v-avatar color="primary" size="40">
            <span class="text-white text-subtitle-2">{{ siglaUsuario }}</span>
          </v-avatar>
        </template>
        <v-list-item-title class="text-body-2 font-weight-medium">{{ nomeUsuario }}</v-list-item-title>
        <v-list-item-subtitle class="text-caption text-medium-emphasis">{{ emailUsuario }}</v-list-item-subtitle>
      </v-list-item>

      <v-divider class="my-2" />

      <v-list-item @click="irPara('/system/minha-conta')">
        <v-list-item-title>Minha conta</v-list-item-title>
      </v-list-item>
      <v-list-item @click="irPara('/system/configuracoes')">
        <v-list-item-title>Configurações</v-list-item-title>
      </v-list-item>
      <v-list-item link @click="useUserStore().logout()">
        <template #append>
          <v-icon color="error" class="mr-2">mdi-logout</v-icon>
        </template>
        <v-list-item-title class="text-error">Logout</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>