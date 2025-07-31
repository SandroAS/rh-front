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
        <p class="font-weight-bold text-subtitle-1">{{ item.name }}</p>
        
        <v-timeline direction="horizontal" side="start" dot-color="primary" class="custom-timeline">
          <v-timeline-item v-for="jobPositionInCareer in item.jobPositionsInCareer" :key="jobPositionInCareer.uuid" size="small">
            <div>
              <p>
                {{ jobPositionInCareer.jobPosition.name }}
              </p>
            </div>
            <template v-slot:opposite>
              <div v-if="jobPositionInCareer.careerPlanY" style="margin-right: -114px;">
                <v-timeline-item
                  size="small"
                  class="custom-timeline-y"
                  :class="{
                    'custom-length-width': jobPositionInCareer.careerPlanY.name.length <= 14,
                    'custom-length-width-2': jobPositionInCareer.careerPlanY.name.length > 14 && jobPositionInCareer.careerPlanY.name.length <= 16,
                    'custom-length-width-3': jobPositionInCareer.careerPlanY.name.length > 16 && jobPositionInCareer.careerPlanY.name.length <= 18,
                    'custom-length-width-4': jobPositionInCareer.careerPlanY.name.length > 18 && jobPositionInCareer.careerPlanY.name.length <= 20,
                    'custom-length-width-5': jobPositionInCareer.careerPlanY.name.length > 20 && jobPositionInCareer.careerPlanY.name.length <= 22,
                    'custom-length-width-6': jobPositionInCareer.careerPlanY.name.length > 22 && jobPositionInCareer.careerPlanY.name.length <= 24,
                    'custom-length-width-7': jobPositionInCareer.careerPlanY.name.length > 24 && jobPositionInCareer.careerPlanY.name.length <= 26,
                    'custom-length-width-8': jobPositionInCareer.careerPlanY.name.length > 26 && jobPositionInCareer.careerPlanY.name.length <= 28,
                    'custom-length-width-9': jobPositionInCareer.careerPlanY.name.length > 28 && jobPositionInCareer.careerPlanY.name.length <= 30,
                    'custom-length-width-10': jobPositionInCareer.careerPlanY.name.length > 30
                  }">
                  <template v-slot:opposite>
                    {{ jobPositionInCareer.careerPlanY.name }}
                  </template>
                </v-timeline-item>
              </div>
            </template>
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
    </v-data-table>

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

.custom-timeline-y .v-timeline-divider .v-timeline-divider__before {
  transform: rotate(45deg);
  margin-top: -65px;
}

.custom-timeline-y .v-timeline-item__opposite {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  text-align: center;
  max-width: 200px;
}

.custom-length-width .v-timeline-divider .v-timeline-divider__before {
  margin-left: 0px !important;
}
.custom-length-width-2 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 5px !important;
}
.custom-length-width-3 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 7px !important;
}
.custom-length-width-4 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 9px !important;
}
.custom-length-width-5 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 13px !important;
}
.custom-length-width-6 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 18px !important;
}
.custom-length-width-7 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 20px !important;
}
.custom-length-width-8 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 22px !important;
}
.custom-length-width-9 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 28px !important;
}
.custom-length-width-10 .v-timeline-divider .v-timeline-divider__before {
  margin-left: 31px !important;
}
</style>
