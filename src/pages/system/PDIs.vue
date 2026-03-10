<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PdisTab from '@/components/system/pdi/tabs/PdisTab.vue';
import PdiCategoriesTab from '@/components/system/pdi/tabs/PdiCategoriesTab.vue';

const route = useRoute();
const router = useRouter();

const tabs = [
  { name: 'PDIs', value: 'pdis' },
  { name: 'Categorias de PDI', value: 'categorias' },
];

const selectedTab = ref(route.query.tab?.toString() || 'pdis');

watch(selectedTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } });
});
</script>

<template>
  <v-container fluid>
    <h2 class="mb-6">PDIs - Plano de Desenvolvimento Individual</h2>

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
        <v-tabs-window-item value="pdis">
          <PdisTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="categorias">
          <PdiCategoriesTab />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-container>
  </v-container>
</template>
