<script setup lang="ts">
import { ref, watch } from 'vue'
import { useJobPositionsLevelsGroupStore } from '../../../../stores/job-positions-levels-group.store';
import loadItems from '@/utils/loadItems.util';
import type JobPositionsLevelsGroup from '@/types/jobPositionsLevelsGroup/job-positions-levels-group.type';
import LevelsGroupModal from '../levelsGroups/LevelsGroupModal.vue';
import { getInitials } from '@/utils/getInitialsFromName.util';
import formatCurrency from '@/utils/formatCurrency.util';

const levelsGroupStore = useJobPositionsLevelsGroupStore();

const dialog = ref(false);
const selectedLevelsGroup = ref<JobPositionsLevelsGroup | null>(null);

const currentPage = ref(levelsGroupStore.page);
const itemsPerPage = ref(levelsGroupStore.limit);
const searchTerm = ref(levelsGroupStore.search_term || '');
const sortBy = ref(levelsGroupStore.sort_column ? [{ key: levelsGroupStore.sort_column, order: levelsGroupStore.sort_order }] : []);

const openDialog = (item?: JobPositionsLevelsGroup) => {
  selectedLevelsGroup.value = item || null;
  dialog.value = true;
}

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
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar grupo de níveis de cargo"
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
        Adicionar níveis de cargo
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Criado por', value: 'created_by_user', align: 'start' },
        { title: 'Níveis', value: 'job_positions_levels', align: 'end', sortable: true },
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
      <template v-slot:[`item.created_by_user`]="{ item }">
        <div class="mb-1">
          <v-chip
            link
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
      <template v-slot:[`item.job_positions_levels`]="{ item }">
        <div class="mb-1">
          <div v-if="item.jobPositionsLevels && item.jobPositionsLevels.length > 0">
            <v-chip
              v-for="jobPositionsLevel in item.jobPositionsLevels.slice(0, 5)"
              :key="jobPositionsLevel.uuid"
              pill
              color="primary"
              size="small"
              class="mt-1 pr-0"
            >
              {{ jobPositionsLevel.name }}
              <v-chip pill color="green" size="small" class="ml-1">
                {{ formatCurrency(jobPositionsLevel.salary) }}
              </v-chip>
            </v-chip>

            <v-chip v-if="item.jobPositionsLevels.length > 5" color="secondary" size="small" class="mt-1">
              ...
            </v-chip>
          </div>
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

    <LevelsGroupModal v-model="dialog" :selectedLevelsGroup="selectedLevelsGroup" />
  </div>
</template>
