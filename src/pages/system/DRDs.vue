<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDRDStore } from '@/stores/drd.store';
import loadItems from '@/utils/loadItems.util';
import type DRD from '@/types/drd/drd.type';
import DRDModal from '@/components/system/drd/DRDModal.vue';
import { useJobPositionStore } from '@/stores/job-position.store';

const DRDStore = useDRDStore();
const jobPositionStore = useJobPositionStore();

const dialog = ref(false);
const selectedDRD = ref<DRD | null>(null);

const currentPage = ref(DRDStore.page);
const itemsPerPage = ref(DRDStore.limit);
const searchTerm = ref(DRDStore.search_term || '');
const sortBy = ref(DRDStore.sort_column ? [{ key: DRDStore.sort_column, order: DRDStore.sort_order }] : []);

const openDialog = (item?: DRD) => {
  selectedDRD.value = item || null;
  dialog.value = true;
}

async function getAllJobPositions() {
  await jobPositionStore.getAllJobPositions();
}

getAllJobPositions();

const loadDRDs = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    DRDStore,
    'getDRDs',
    'drds'
  );

  currentPage.value = DRDStore.page;
  itemsPerPage.value = DRDStore.limit;
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadDRDs();
  }, 300);
});

onMounted(async () => {
  loadDRDs();
});
</script>

<template>
  <v-container fluid>
    <h2 class="mb-6">Descritivo de Resultado e Desempenho</h2>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar DRD"
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
        Adicionar DRD
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Descrição', value: 'description', sortable: true },
        { title: 'Valor (R$)', value: 'price', align: 'end' },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="DRDStore.drds || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="DRDStore.total"
      :loading="DRDStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadDRDs"
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

    <DRDModal v-model="dialog" :selectedDRD="selectedDRD" />
  </v-container>
</template>
