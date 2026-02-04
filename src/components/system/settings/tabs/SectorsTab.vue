<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useSectorStore } from '../../../../stores/sector.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import loadItems from '@/utils/loadItems.util'; 
import type Sector from '../../../../types/sector/sector.type';
import SectorModal from '../sectors/SectorModal.vue';
import { getInitials } from '@/utils/getInitialsFromName.util';

const MAX_VISIBLE_USERS = 3;

const sectorStore = useSectorStore();
const accountUserStore = useAccountUserStore();

const dialog = ref(false);
const selectedSector = ref<Sector | null>(null);

const currentPage = ref(sectorStore.page);
const itemsPerPage = ref(sectorStore.limit);
const searchTerm = ref(sectorStore.search_term || '');
const sortBy = ref(sectorStore.sort_column ? [{ key: sectorStore.sort_column, order: sectorStore.sort_order }] : []);

const openDialog = (item?: Sector) => {
  selectedSector.value = item || null;
  dialog.value = true;
}

async function getAccountUsers() {
  await accountUserStore.getAllAccountUsers();
}

getAccountUsers()

const loadSectors = async ({ page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam }: { page: number, itemsPerPage: number, sortBy: any[] }) => {
  currentPage.value = page;
  itemsPerPage.value = itemsPerPageParam;
  sortBy.value = sortByParam;

  await loadItems(
    { page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam },
    searchTerm.value,
    sectorStore,
    'getSectors',
    'sectors'
  );

  currentPage.value = sectorStore.page;
  itemsPerPage.value = sectorStore.limit;

  if (sectorStore.sort_column) {
    sortBy.value = [{ key: sectorStore.sort_column, order: sectorStore.sort_order || 'asc' }];
  } else {
    sortBy.value = [];
  }
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadSectors({
      page: sectorStore.page,
      itemsPerPage: sectorStore.limit,
      sortBy: sectorStore.sort_column ? [{ key: sectorStore.sort_column, order: sectorStore.sort_order || 'asc' }] : []
    });
  }, 300);
});

onMounted(() => {
  loadSectors({
    page: sectorStore.page,
    itemsPerPage: sectorStore.limit,
    sortBy: sectorStore.sort_column ? [{ key: sectorStore.sort_column, order: sectorStore.sort_order || 'asc' }] : []
  });
});
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar setor"
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
        Adicionar setor
      </v-btn>
    </div>

    <v-data-table-server
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Usuários', value: 'users', sortable: false, align: 'start' },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="sectorStore.sectors || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="sectorStore.total"
      :loading="sectorStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadSectors"
    >
      <template #item.users="{ item }">
        <div class="mb-1">
          <div v-if="!item.users || item.users.length === 0" class="text-caption text-medium-emphasis">
            Nenhum usuário
          </div>
          <template v-else>
            <v-chip
              v-for="user in item.users.slice(0, MAX_VISIBLE_USERS)"
              :key="user.uuid"
              pill
              size="small"
              class="mt-1"
              :class="{'pl-0': !user.profile_img_url}"
            >
              <v-avatar v-if="user.profile_img_url" start>
                <v-img :src="user.profile_img_url"></v-img>
              </v-avatar>
              <v-avatar v-else color="primary" class="mr-1">
                <span class="text-white">{{ getInitials(user.name) }}</span>
              </v-avatar>

              {{ user.name }}
            </v-chip>
            <div v-if="item.users.length > MAX_VISIBLE_USERS" class="text-caption text-medium-emphasis mt-1">
              +{{ item.users.length - MAX_VISIBLE_USERS }} {{ item.users.length - MAX_VISIBLE_USERS === 1 ? 'usuário' : 'usuários' }}
            </div>
          </template>
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
    </v-data-table-server>

    <SectorModal v-model="dialog" :selectedSector="selectedSector" />
  </div>
</template>
