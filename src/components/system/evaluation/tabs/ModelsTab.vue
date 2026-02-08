<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useEvaluationStore } from '@/stores/evaluation.store';
import loadItems from '@/utils/loadItems.util';
import type Evaluation from '@/types/evaluation/evaluation.type';
import EvaluationModal from '@/components/system/evaluation/EvaluationModal.vue';
import { useDRDStore } from '@/stores/drd.store';
import { getInitials } from '@/utils/getInitialsFromName.util';

const evaluationStore = useEvaluationStore();
const drdStore = useDRDStore();

const dialog = ref(false);
const selectedEvaluation = ref<Evaluation | null>(null);

const currentPage = ref(evaluationStore.page);
const itemsPerPage = ref(evaluationStore.limit);
const searchTerm = ref(evaluationStore.search_term || '');
const sortBy = ref(evaluationStore.sort_column ? [{ key: evaluationStore.sort_column, order: evaluationStore.sort_order }] : []);

const openDialog = (item?: Evaluation) => {
  selectedEvaluation.value = item || null;
  dialog.value = true;
}

async function getAllDRDs() {
  await drdStore.getAllDRDs();
}

getAllDRDs();

const loadEvaluations = async ({ page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam }: { page: number, itemsPerPage: number, sortBy: any[] }) => {
  currentPage.value = page;
  itemsPerPage.value = itemsPerPageParam;
  sortBy.value = sortByParam;

  await loadItems(
    { page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam },
    searchTerm.value,
    evaluationStore,
    'getEvaluations',
    'evaluations'
  );

  currentPage.value = evaluationStore.page;
  itemsPerPage.value = evaluationStore.limit;

  if (evaluationStore.sort_column) {
    sortBy.value = [{ key: evaluationStore.sort_column, order: evaluationStore.sort_order || 'asc' }];
  } else {
    sortBy.value = [];
  }
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return;

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadEvaluations({
      page: evaluationStore.page,
      itemsPerPage: evaluationStore.limit,
      sortBy: evaluationStore.sort_column ? [{ key: evaluationStore.sort_column, order: evaluationStore.sort_order || 'asc' }] : []
    });
  }, 300);
});

onMounted(() => {
  loadEvaluations({
    page: evaluationStore.page,
    itemsPerPage: evaluationStore.limit,
    sortBy: evaluationStore.sort_column ? [{ key: evaluationStore.sort_column, order: evaluationStore.sort_order || 'asc' }] : []
  });
});
</script>

<template>
  <v-container fluid>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar Avaliação"
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
        Adicionar Avaliação
      </v-btn>
    </div>

    <v-data-table-server
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Criado por', value: 'createdBy', sortable: true },
        { title: 'Descritivo de Cargos', value: 'drd', sortable: true },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="evaluationStore.evaluations || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="evaluationStore.total"
      :loading="evaluationStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadEvaluations"
    >
      <template #item.createdBy="{ item }">
        <div class="d-flex align-center gap-3 flex-row-reverse flex-md-row">
          <v-avatar color="primary" size="36" class="mr-2 ml-sm-2 mr-sm-0">
            <template v-if="item.createdBy?.profile_img_url">
              <v-img :src="item.createdBy.profile_img_url"></v-img>
            </template>
            <template v-else>
              {{ getInitials(item.createdBy?.name) }}
            </template>
          </v-avatar>
          <div class="text-md-left text-right text-left">
            <div class="font-weight-medium">{{ item.createdBy?.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.createdBy?.email }}</div>
          </div>
        </div>
      </template>
      <template #item.drd="{ item }">
        {{ item.drd?.jobPosition.title }}
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <div>
          <v-btn icon @click="openDialog(item)" size="small">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <!-- <v-btn icon color="red" @click="evaluationStore.deleteEvaluation(item.uuid)" size="small">
            <v-icon>mdi-delete</v-icon>
          </v-btn> -->
        </div>
      </template>
    </v-data-table-server>

    <EvaluationModal v-model="dialog" :selectedEvaluation="selectedEvaluation" />
  </v-container>
</template>