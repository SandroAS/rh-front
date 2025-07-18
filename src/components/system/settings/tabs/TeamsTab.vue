<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useTeamStore } from '../../../../stores/team.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import loadItems from '@/utils/loadItems.util';
import type Team from '../../../../types/team/team.type';
import TeamModal from '../teams/TeamModal.vue';

const teamStore = useTeamStore();
const accountUserStore = useAccountUserStore();

const dialog = ref(false);
const selectedTeam = ref<Team | null>(null);

const currentPage = ref(teamStore.page);
const itemsPerPage = ref(teamStore.limit);
const searchTerm = ref(teamStore.search_term || '');
const sortBy = ref(teamStore.sort_column ? [{ key: teamStore.sort_column, order: teamStore.sort_order }] : []);

const openDialog = (item?: Team) => {
  selectedTeam.value = item || null;
  dialog.value = true;
}

async function getTeams() {
  await teamStore.getTeams({ page: currentPage.value, limit: itemsPerPage.value });
}

async function getAccountUsers() {
  await accountUserStore.getAccountUsers({page: 1, limit: 10000 });
}

getTeams();
getAccountUsers()

const loadTeams = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    teamStore,
    'getTeams',
    'teams'
  );

  currentPage.value = teamStore.page;
  itemsPerPage.value = teamStore.limit;
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadTeams();
  }, 300);
});

onMounted(async () => {
  loadTeams();
});
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar time"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="mb-4 mb-md-0 w-md-auto w-100"
        style="max-width: 300px;"
      ></v-text-field>

      <v-btn color="primary" class="w-md-auto w-100" @click="openDialog">
        <v-icon start>mdi-plus</v-icon>
        Adicionar time
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Membros', value: 'users', sortable: true },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="teamStore.teams || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="teamStore.total"
      :loading="teamStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadTeams"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <div>
          <v-btn icon @click="openDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <!-- <v-btn icon color="red" @click="deleteService(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn> -->
        </div>
      </template>
    </v-data-table>

    <TeamModal v-model="dialog" :selectedTeam="selectedTeam" />
  </div>
</template>
