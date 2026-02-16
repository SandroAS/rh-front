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
</script>

<template>
  <v-container fluid>
    <h2 class="mb-6">Plano de Carreiras</h2>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar plano de carreira"
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
        Adicionar Plano de Carreira
      </v-btn>
    </div>

    <v-data-table-server
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
        <p class="font-weight-bold text-subtitle-1">{{ item.name }}</p>
        <v-timeline direction="horizontal" side="start" dot-color="primary" class="custom-timeline">
          <v-timeline-item
            v-for="jpic in item.careerPlanJobPositions"
            :key="jpic.uuid"
            size="small"
          >
            <div>
              <p>{{ jpic.jobPosition?.title ?? '-' }}</p>
            </div>
          </v-timeline-item>
        </v-timeline>
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

    <CareerPlanModal v-model="dialog" :selectedCareerPlan="selectedCareerPlan" />
  </v-container>
</template>

<style>
.custom-timeline .v-timeline-item__body {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

@media (max-width: 959px) {
  .custom-timeline {
    max-width: 500px;
    overflow: auto;
  }
}

@media (max-width: 659px) {
  .custom-timeline {
    max-width: 300px;
    overflow: auto;
  }
}

@media (max-width: 400px) {
  .custom-timeline {
    max-width: 200px;
    overflow: auto;
  }
}

</style>
