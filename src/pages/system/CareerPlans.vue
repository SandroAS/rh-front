<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import loadItems from '@/utils/loadItems.util';
import { useCareerPlanStore } from '../../stores/career-plan.store';
import type CareerPlan from '@/types/careerPlan/career-plan.type';
import CareerPlanModal from '@/components/system/careerPlan/CareerPlanModal.vue';
import { useJobPositionStore } from '@/stores/job-position.store';

const careerPlanStore = useCareerPlanStore();
const jobPositionStore = useJobPositionStore();

async function getAllJobPositions() {
  await jobPositionStore.getAllJobPositions();
}

getAllJobPositions();

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
        <div class="name-cell-wrapper mb-3">
          <p class="font-weight-bold text-subtitle-1 mb-2">{{ item.name }}</p>
          <div class="career-path">
            <!-- Linha dos títulos -->
            <div class="career-path-row career-titles-row d-flex align-start">
              <template v-for="(jpic, index) in item.careerPlanJobPositions.reverse()" :key="'title-' + jpic.uuid">
                <div
                  class="career-title-cell shrink-0"
                  :class="{
                    'career-title-cell--first': index === 0 && item.careerPlanJobPositions.length > 1,
                    'career-title-cell--last': index === item.careerPlanJobPositions.length - 1 && item.careerPlanJobPositions.length > 1,
                    'career-title-cell--middle': item.careerPlanJobPositions.length === 1 || (index > 0 && index < item.careerPlanJobPositions.length - 1)
                  }"
                >
                  <p class="career-step-title text-caption">{{ jpic.jobPosition?.title ?? '-' }}</p>
                </div>
                <div
                  v-if="index < item.careerPlanJobPositions.length - 1"
                  class="career-progress-wrapper flex-grow-1 career-spacer"
                />
              </template>
            </div>
            <!-- Linha dos avatares + progress bar -->
            <div class="career-path-row career-avatars-row d-flex align-center">
              <template v-for="(jpic, index) in item.careerPlanJobPositions.reverse()" :key="jpic.uuid">
                <div class="career-avatar-cell shrink-0">
                  <v-avatar size="28" color="primary" class="career-step-avatar" />
                </div>
                <div
                  v-if="index < item.careerPlanJobPositions.length - 1"
                  class="career-progress-wrapper flex-grow-1"
                >
                  <v-progress-linear
                    :model-value="100"
                    color="blue-grey-lighten-4"
                    class="career-progressbar"
                    rounded
                  />
                </div>
              </template>
            </div>
            <div v-if="item.careerPlanJobPositions.some(jpic => jpic.careerPlanY?.uuid)" class="career-path-row career-titles-row d-flex align-start">
              <template v-for="(jpic, index) in item.careerPlanJobPositions.reverse()" :key="'title-' + jpic.uuid">
                <div v-if="jpic.careerPlanY?.uuid" class="d-flex align-center">
                  <div class="mb-6 ml-5">
                    <v-progress-linear
                      :model-value="100"
                      color="blue-grey-lighten-4"
                      class="career-progressbar-diagonal"
                      rounded
                    />
                  </div>
                  <div class="mt-4">
                    <p class="career-step-title career-title-cell--first text-caption mb-1">{{ jpic.careerPlanY?.name }}</p>
                    <v-avatar size="28" color="primary" class="career-step-avatar" />
                  </div>
                </div>
              </template>
            </div>
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
    </v-data-table-server>

    <CareerPlanModal v-model="dialog" :selectedCareerPlan="selectedCareerPlan" />
  </v-container>
</template>

<style scoped>
.name-cell-wrapper {
  overflow-x: auto;
  max-width: 100%;
  min-width: 0;
}

.career-path {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: min-content;
}

.career-path-row {
  flex-wrap: nowrap;
  min-width: 0;
}

.career-title-cell {
  width: 140px;
  min-width: 140px;
  flex-shrink: 0;
}

.career-title-cell {
  display: flex;
}

.career-title-cell--first {
  justify-content: flex-start;
}

.career-title-cell--last {
  justify-content: flex-end;
}

.career-title-cell--middle {
  justify-content: center;
}

.career-avatar-cell {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.career-step-title {
  max-width: 140px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  line-height: 1.2;
  margin: 0;
}

.career-title-cell--first .career-step-title {
  text-align: left;
}

.career-title-cell--last .career-step-title {
  text-align: right;
}

.career-title-cell--middle .career-step-title {
  text-align: center;
}

.career-step-avatar {
  flex-shrink: 0;
}

.career-progress-wrapper {
  min-width: 24px;
  align-self: stretch;
  display: flex;
  align-items: center;
  margin: 0 4px;
}

.career-spacer {
  min-height: 1px;
}

.career-progressbar {
  width: 100%;
  min-height: 6px;
}

.career-progressbar-diagonal {
  width: 50px;
  min-height: 6px;
  transform: rotate(45deg);
}
</style>
