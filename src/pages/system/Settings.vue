<script setup lang="ts">
import UsersTab from '@/components/system/settings/tabs/UsersTab.vue'
import RolePermissionsTab from '@/components/system/settings/tabs/RolePermissionsTab.vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JobPositionsTab from '@/components/system/settings/tabs/JobPositionsTab.vue'
import LevelsGroupsTab from '@/components/system/settings/tabs/LevelsGroupsTab.vue'
import TeamsTab from '../../components/system/settings/tabs/TeamsTab.vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'Usuários', value: 'usuarios' },
  { name: 'Permissões', value: 'permissoes' },
  { name: 'Cargos', value: 'job-positions' },
  { name: 'Níves de Cargos', value: 'levels-groups' },
  { name: 'Times', value: 'teams' }
];

const selectedTab = ref(route.query.tab || 'usuarios');

watch(selectedTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
});
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
      <v-tabs-window v-model="selectedTab" class="px-1">
        <v-tabs-window-item value="usuarios">
          <UsersTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="permissoes">
          <RolePermissionsTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="job-positions">
          <JobPositionsTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="levels-groups">
          <LevelsGroupsTab />
        </v-tabs-window-item>

        <v-tabs-window-item value="teams">
          <TeamsTab />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-container>
  </v-container>
</template>
