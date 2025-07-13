<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import loadItems from '@/utils/loadItems.util';
import { useCareerPlanStore } from '../../stores/career-plan.store';
import type CareerPlan from '@/types/careerPlan/career-plan.type';
import CareerPlanModal from '@/components/system/careerPlan/CareerPlanModal.vue';
import { useJobPositionStore } from '@/stores/job-position.store';

const careerPlanStore = useCareerPlanStore();
const jobPositionStore = useJobPositionStore();


const dialog = ref(false);
const selectedCareerPlan = ref<CareerPlan | null>(null);

const currentPage = ref(careerPlanStore.page);
const itemsPerPage = ref(careerPlanStore.limit);
const searchTerm = ref(careerPlanStore.search_term || '');
const sortBy = ref(careerPlanStore.sort_column ? [{ key: careerPlanStore.sort_column, order: careerPlanStore.sort_order }] : []);

const openDialog = (item?: CareerPlan) => {
  selectedCareerPlan.value = item || null;
  dialog.value = true;
}

async function getCareerPlans() {
  await careerPlanStore.getCareerPlans({ page: currentPage.value, limit: itemsPerPage.value });
}

async function getJobPositions() {
  await jobPositionStore.getJobPositions({ page: 1, limit: 1000 });
}

getCareerPlans();
getJobPositions();

const loadCareerPlans = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    careerPlanStore,
    'getCareerPlans',
    'careerPlans'
  );

  currentPage.value = careerPlanStore.page;
  itemsPerPage.value = careerPlanStore.limit;
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadCareerPlans();
  }, 300);
});

onMounted(async () => {
  loadCareerPlans();
});
</script>

<template>
  <v-container fluid>
    <h2 class="mb-6">Plano de Carreiras</h2>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar plano de carreira"
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
        Adicionar Plano de Carreira
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="careerPlanStore.careerPlans || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="careerPlanStore.total"
      :loading="careerPlanStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadCareerPlans"
    >
      <template #item.name="{ item }">
        
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

    <CareerPlanModal v-model="dialog" :selectedCareerPlan="selectedCareerPlan" />
  </v-container>
</template>
