<script setup lang="ts">
import UsersTab from '@/components/system/settings/tabs/UsersTab.vue'
import RolePermissionsTab from '@/components/system/settings/tabs/RolePermissionsTab.vue'
import OdontogramaCategoriesTab from '@/components/system/settings/tabs/OdontogramaCategoriesTab.vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServicesTab from '@/components/system/settings/tabs/ServicesTab.vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'Usuários', value: 'usuarios' },
  { name: 'Permissões', value: 'permissoes' },
  { name: 'Serviços', value: 'servicos' },
  { name: 'Categorias de Odontograma', value: 'categorias-odontograma' }
]

const selectedTab = ref(route.query.tab || 'usuarios')

watch(selectedTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
})
</script>

<template>
  <v-container fluid>
    <v-tabs
      v-model="selectedTab"
      class="border-b"
    >
      <v-tab
        v-for="(tab, index) in tabs"
        :key="index"
        :value="tab.value"
      >
        {{ tab.name }}
      </v-tab>
    </v-tabs>

    <v-container class="py-12">
      <v-tabs-window v-model="selectedTab">
        <v-tabs-window-item value="usuarios">
          <UsersTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="permissoes">
          <RolePermissionsTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="servicos">
          <ServicesTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="categorias-odontograma">
          <OdontogramaCategoriesTab />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-container>
  </v-container>
</template>
