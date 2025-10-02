<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTeamStore } from '../../../../stores/team.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import loadItems from '@/utils/loadItems.util'; 
import type Team from '../../../../types/team/team.type';
import TeamModal from '../teams/TeamModal.vue';
import { getInitials } from '@/utils/getInitialsFromName.util';

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

async function getAccountUsers() {
  await accountUserStore.getAllAccountUsers();
}

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
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar time"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
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
        { title: 'Criado por', value: 'created_by_user', align: 'start' },
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
      <template v-slot:[`item.created_by_user`]="{ item }">
        <div class="mb-1">
          <v-chip
            pill
            size="small"
            class="mt-1"
          >
            <v-avatar v-if="item.createdBy.profile_img_url" start>
              <v-img :src="item.createdBy.profile_img_url"></v-img>
            </v-avatar>
            <v-avatar v-else size="28" class="mr-2" color="primary">
              <span class="text-caption font-weight-bold">{{ getInitials(item.createdBy.name) }}</span>
            </v-avatar>

            {{ item.createdBy.name }}
          </v-chip>
        </div>
      </template>
      <template #item.users="{ item }">
        <div class="mb-1">
          <v-chip
            v-for="teamMember in item.teamMembers"
            pill
            size="small"
            class="mt-1"
          >
            <v-avatar v-if="teamMember.user.profile_img_url" start>
              <v-img :src="teamMember.user.profile_img_url"></v-img>
            </v-avatar>

            <v-avatar v-else color="primary" class="mr-1">
              <span class="text-white">{{ getInitials(teamMember.user.name) }}</span>
            </v-avatar>

            {{ teamMember.user.name }}
          </v-chip>
        </div>
      </template>

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
