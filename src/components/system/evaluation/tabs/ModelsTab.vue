<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useEvaluationStore } from '@/stores/evaluation.store';
import loadItems from '@/utils/loadItems.util';
import type Evaluation from '@/types/evaluation/evaluation.type';
import EvaluationModal from '@/components/system/evaluation/EvaluationModal.vue';
import { useAccountUserStore } from '@/stores/account-user.store';

const evaluationStore = useEvaluationStore();
const accountUserStore = useAccountUserStore();

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

async function getEvaluations() {
  await evaluationStore.getEvaluations({ page: currentPage.value, limit: itemsPerPage.value });
}

async function getAccountUsers() {
  await accountUserStore.getAccountUsers({page: 1, limit: 10000 });
}

getEvaluations();
getAccountUsers();

const loadEvaluations = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    evaluationStore,
    'getEvaluations',
    'evaluations'
  );

  currentPage.value = evaluationStore.page;
  itemsPerPage.value = evaluationStore.limit;
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return;

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadEvaluations();
  }, 300);
});

onMounted(async () => {
  loadEvaluations();
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

    <v-data-table
      :headers="[
        { title: 'Título', value: 'title', sortable: true },
        { title: 'Criado por', value: 'created_by_user_id', sortable: true },
        { title: 'DRD', value: 'drd_id', sortable: true },
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
    </v-data-table>

    <EvaluationModal v-model="dialog" :selectedEvaluation="selectedEvaluation" />
  </v-container>
</template>