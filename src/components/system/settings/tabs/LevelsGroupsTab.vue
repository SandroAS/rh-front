<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useLevelsGroupStore } from '../../../../stores/levels-group.store';
import loadItems from '@/utils/loadItems.util';
import type LevelsGroup from '@/types/levelsGroup/levels-group.type';
import LevelsGroupModal from '../levelsGroups/LevelsGroupModal.vue';

const levelsGroupStore = useLevelsGroupStore();

const dialog = ref(false);
const selectedLevelsGroup = ref<LevelsGroup | null>(null);

const currentPage = ref(levelsGroupStore.page);
const itemsPerPage = ref(levelsGroupStore.limit);
const searchTerm = ref(levelsGroupStore.search_term || '');
const sortBy = ref(levelsGroupStore.sort_column ? [{ key: levelsGroupStore.sort_column, order: levelsGroupStore.sort_order }] : []);

const openDialog = (item?: LevelsGroup) => {
  selectedLevelsGroup.value = item || null;
  dialog.value = true;
}

async function getLevelsGroups() {
  await levelsGroupStore.getLevelsGroupsPagination({ page: currentPage.value, limit: itemsPerPage.value });
}

getLevelsGroups()

const leadLevelsGrupos = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    levelsGroupStore,
    'getLevelsGroupsPagination',
    'levels_groups'
  );

  currentPage.value = levelsGroupStore.page;
  itemsPerPage.value = levelsGroupStore.limit;
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    leadLevelsGrupos();
  }, 300);
});

onMounted(async () => {
  leadLevelsGrupos();
});
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar grupo de níveis de cargo"
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
        Adicionar níveis de cargo
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Criado por', value: 'created_by_user', align: 'end' },
        { title: 'Criado em', value: 'created_at', align: 'end', sortable: true },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="levelsGroupStore.levels_groups || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="levelsGroupStore.total"
      :loading="levelsGroupStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="leadLevelsGrupos"
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

    <LevelsGroupModal v-model="dialog" :selectedLevelsGroup="selectedLevelsGroup" />
  </div>
</template>
