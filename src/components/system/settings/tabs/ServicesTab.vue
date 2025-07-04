<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useServiceStore } from '@/stores/service.store';
import { useSystemModuleStore } from '@/stores/system-module.store';
import type Service from '@/types/service/service.type';
import ServiceModal from '../services/ServiceModal.vue';
import loadItems from '@/utils/loadItems.util';

const serviceStore = useServiceStore();
const systemModuleStore = useSystemModuleStore();

const dialog = ref(false);
const selectedService = ref<Service | null>(null);

const currentPage = ref(serviceStore.page);
const itemsPerPage = ref(serviceStore.limit);
const searchTerm = ref(serviceStore.search_term || '');
const sortBy = ref(serviceStore.sort_column ? [{ key: serviceStore.sort_column, order: serviceStore.sort_order }] : []);

const openDialog = (item?: Service) => {
  selectedService.value = item || null;
  dialog.value = true;
}

async function getServices() {
  await serviceStore.getServices({ page: currentPage.value, limit: itemsPerPage.value });
}

async function getSystemModules() {
  await systemModuleStore.getSystemModules();
}

getServices();
getSystemModules()

const loadServices = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    serviceStore,
    'getServices',
    'services'
  );

  currentPage.value = serviceStore.page;
  itemsPerPage.value = serviceStore.limit;
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
        Adicionar serviço
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Descrição', value: 'description', sortable: true },
        { title: 'Valor (R$)', value: 'price', align: 'end' },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="serviceStore.services || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="serviceStore.total"
      :loading="serviceStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadServices"
    >
      <template v-slot:[`item.price`]="{ item }">
        R$ {{ item.price }}
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

    <ServiceModal v-model="dialog" :selectedService="selectedService" />
  </div>
</template>
