<script setup lang="ts">
import ModelsTab from '@/components/system/evaluation/tabs/ModelsTab.vue';
import ApplicationsTab from '@/components/system/evaluation/tabs/ApplicationsTab.vue';
import MetricsTab from '@/components/system/evaluation/tabs/MetricsTab.vue';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const tabs = [
  { name: 'Modelos', value: 'modelos' },
  { name: 'Aplicações', value: 'aplicacoes' },
  { name: 'Métricas', value: 'metricas' }
];

// O valor inicial da tab selecionada será o que estiver na URL ou 'modelos' por padrão
const selectedTab = ref(route.query.tab?.toString() || 'modelos');

// Observa mudanças na tab selecionada e atualiza a URL
watch(selectedTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } });
});
</script>

<template>
  <v-container fluid>
    <h2 class="mb-6">Gerenciamento de Avaliações</h2>

    <v-tabs
      v-model="selectedTab"
      class="border-b"
      align-tabs="start"
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
        <v-tabs-window-item value="modelos">
          <ModelsTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="aplicacoes">
          <ApplicationsTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="metricas">
          <MetricsTab />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-container>
  </v-container>
</template>