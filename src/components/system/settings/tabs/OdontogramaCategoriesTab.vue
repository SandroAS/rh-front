<script setup lang="ts">
import { useOdontogramaCategoryStore } from '@/stores/odontograma-category.store';
import type OdontogramaCategory from '@/types/odontogramaCategory/odontograma-category.type';
import { ref, watch, onMounted } from 'vue'
import OdontogramaCategoryModal from '../odontogramaCategories/OdontogramaCategoryModal.vue';
import loadItems from '@/utils/loadItems.util';

const odontogramaCategoryStore = useOdontogramaCategoryStore();

const dialog = ref(false)
const selectedOdontogramaCategory = ref<OdontogramaCategory | null>(null);

const currentPage = ref(odontogramaCategoryStore.page);
const itemsPerPage = ref(odontogramaCategoryStore.limit);
const searchTerm = ref(odontogramaCategoryStore.search_term || '');
const sortBy = ref(odontogramaCategoryStore.sort_column ? [{ key: odontogramaCategoryStore.sort_column, order: odontogramaCategoryStore.sort_order }] : []);

const openDialog = (item?: OdontogramaCategory) => {
  selectedOdontogramaCategory.value = item || null;
  dialog.value = true;
}

async function getOdontogramaCategories() {
  await odontogramaCategoryStore.getOdontogramaCategories({ page: currentPage.value, limit: itemsPerPage.value });
}

getOdontogramaCategories();

const loadOdontogramaCategories = async () => {
  await loadItems(
    { page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value },
    searchTerm.value,
    odontogramaCategoryStore,
    'getOdontogramaCategories',
    'odontograma_categories'
  );

  currentPage.value = odontogramaCategoryStore.page;
  itemsPerPage.value = odontogramaCategoryStore.limit;
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadOdontogramaCategories();
  }, 300);
});

onMounted(() => {
  loadOdontogramaCategories();
});
</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" @click="openDialog()">
        <v-icon start>mdi-plus</v-icon>
        Nova Categoria
      </v-btn>
    </div>

    <v-data-table
      :headers="[
        { title: 'Nome', value: 'name' },
        { title: 'Cor', value: 'color' },
        { title: 'Tipo', value: 'type' },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="odontogramaCategoryStore.odontograma_categories || []"
      item-key="id"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <div>
          <v-btn
            icon
            @click="openDialog(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <!-- <v-btn
            icon
            color="red"
            :disabled="item.predefined"
            @click="deleteCategory(item.id)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn> -->
        </div>
      </template>
    </v-data-table>

    <OdontogramaCategoryModal v-model="dialog" :selectedService="selectedOdontogramaCategory" />
  </div>
</template>
