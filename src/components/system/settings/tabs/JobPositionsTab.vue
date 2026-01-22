<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useJobPositionStore } from '../../../../stores/job-position.store';
import { useJobPositionsLevelsGroupStore } from '../../../../stores/job-positions-levels-group.store';
import loadItems from '@/utils/loadItems.util';
import type JobPosition from '@/types/jobPosition/job-position.type';
import JobPositionModal from '../jobPositions/JobPositionModal.vue';
import formatCurrency from '@/utils/formatCurrency.util.ts';

const jobPositionStore = useJobPositionStore();
const levelsGroupeStore = useJobPositionsLevelsGroupStore();

const dialog = ref(false);
const selectedJobPosition = ref<JobPosition | null>(null);

const currentPage = ref(jobPositionStore.page);
const itemsPerPage = ref(jobPositionStore.limit);
const searchTerm = ref(jobPositionStore.search_term || '');
const sortBy = ref(jobPositionStore.sort_column ? [{ key: jobPositionStore.sort_column, order: jobPositionStore.sort_order }] : []);

const openDialog = (item?: JobPosition) => {
  selectedJobPosition.value = item || null;
  dialog.value = true;
}

async function getLevelsGroups() {
  await levelsGroupeStore.getLevelsGroups();
}

getLevelsGroups()

const loadJobPositions = async ({ page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam }: { page: number, itemsPerPage: number, sortBy: any[] }) => {
  currentPage.value = page;
  itemsPerPage.value = itemsPerPageParam;
  sortBy.value = sortByParam;

  await loadItems(
    { page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam },
    searchTerm.value,
    jobPositionStore,
    'getJobPositions',
    'job_positions'
  );

  currentPage.value = jobPositionStore.page;
  itemsPerPage.value = jobPositionStore.limit;

  if (jobPositionStore.sort_column) {
    sortBy.value = [{ key: jobPositionStore.sort_column, order: jobPositionStore.sort_order || 'asc' }];
  } else {
    sortBy.value = [];
  }
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadJobPositions({
      page: jobPositionStore.page,
      itemsPerPage: jobPositionStore.limit,
      sortBy: jobPositionStore.sort_column ? [{ key: jobPositionStore.sort_column, order: jobPositionStore.sort_order || 'asc' }] : []
    });
  }, 300);
});

onMounted(() => {
  loadJobPositions({
    page: jobPositionStore.page,
    itemsPerPage: jobPositionStore.limit,
    sortBy: jobPositionStore.sort_column ? [{ key: jobPositionStore.sort_column, order: jobPositionStore.sort_order || 'asc' }] : []
  });
});
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar cargo"
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
        Adicionar cargo
      </v-btn>
    </div>

    <v-data-table-server
      :headers="[
        { title: 'Título', value: 'title', sortable: true },
        { title: 'Descrição', value: 'description', sortable: true },
        { title: 'Valor (R$)', value: 'base_salary', align: 'end' },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="jobPositionStore.job_positions || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="jobPositionStore.total"
      :loading="jobPositionStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadJobPositions"
    >
      <template v-slot:[`item.base_salary`]="{ item }">
        {{ formatCurrency(item.base_salary) }}
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

    <JobPositionModal v-model="dialog" :selectedJobPosition="selectedJobPosition" />
  </div>
</template>
