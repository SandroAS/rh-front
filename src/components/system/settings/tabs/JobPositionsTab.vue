<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useJobPositionStore } from '../../../../stores/job-position.store';
import { useLevelsGroupStore } from '../../../../stores/levels-group.store';
import loadItems from '@/utils/loadItems.util';
import type JobPosition from '@/types/jobPosition/job-position.type';
import JobPositionModal from '../services/JobPositionModal.vue';

const jobPositionStore = useJobPositionStore();
const levelsGroupeStore = useLevelsGroupStore();

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

async function getJobPositions() {
  await jobPositionStore.getJobPositions({ page: currentPage.value, limit: itemsPerPage.value });
}

async function getLevelsGroups() {
  await levelsGroupeStore.getLevelsGroups();
}

getJobPositions();
getLevelsGroups()

const loadServices = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    jobPositionStore,
    'getJobPositions',
    'job_positions'
  );

  currentPage.value = jobPositionStore.page;
  itemsPerPage.value = jobPositionStore.limit;
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadServices();
  }, 300);
});

onMounted(async () => {
  loadServices();
});
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar usuário"
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
        Adicionar cargo
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Descrição', value: 'description', sortable: true },
        { title: 'Valor (R$)', value: 'price', align: 'end' },
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
      @update:options="loadServices"
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

    <JobPositionModal v-model="dialog" :selectedService="selectedJobPosition" />
  </div>
</template>
