<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { usePdiCategoryStore } from '@/stores/pdi-category.store';
import loadItems from '@/utils/loadItems.util';

const pdiCategoryStore = usePdiCategoryStore();

const currentPage = ref(pdiCategoryStore.page);
const itemsPerPage = ref(pdiCategoryStore.limit);
const searchTerm = ref(pdiCategoryStore.search_term || '');
const sortBy = ref(
  pdiCategoryStore.sort_column ? [{ key: pdiCategoryStore.sort_column, order: pdiCategoryStore.sort_order || 'asc' }] : []
);

const loadPdiCategories = async ({
  page,
  itemsPerPage: itemsPerPageParam,
  sortBy: sortByParam,
}: {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: 'asc' | 'desc' }[];
}) => {
  currentPage.value = page;
  itemsPerPage.value = itemsPerPageParam;
  sortBy.value = sortByParam;

  await loadItems(
    { page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam },
    searchTerm.value,
    pdiCategoryStore,
    'getPdiCategories',
    'pdi_categories'
  );

  currentPage.value = pdiCategoryStore.page;
  itemsPerPage.value = pdiCategoryStore.limit;
  if (pdiCategoryStore.sort_column) {
    sortBy.value = [{ key: pdiCategoryStore.sort_column, order: pdiCategoryStore.sort_order || 'asc' }];
  } else {
    sortBy.value = [];
  }
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return;
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadPdiCategories({
      page: pdiCategoryStore.page,
      itemsPerPage: pdiCategoryStore.limit,
      sortBy: pdiCategoryStore.sort_column ? [{ key: pdiCategoryStore.sort_column, order: pdiCategoryStore.sort_order || 'asc' }] : [],
    });
  }, 300);
});

onMounted(() => {
  loadPdiCategories({
    page: pdiCategoryStore.page,
    itemsPerPage: pdiCategoryStore.limit,
    sortBy: pdiCategoryStore.sort_column ? [{ key: pdiCategoryStore.sort_column, order: pdiCategoryStore.sort_order || 'asc' }] : [],
  });
});
</script>

<template>
  <v-container fluid>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar Categoria de PDI"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        density="compact"
        hide-details
        clearable
        class="mb-4 mb-md-0 w-md-auto w-100"
        style="max-width: 300px;"
      />

      <v-btn color="primary" class="w-md-auto w-100" disabled>
        <v-icon start>mdi-plus</v-icon>
        Adicionar Categoria
      </v-btn>
    </div>

    <v-data-table-server
      :headers="[
        { title: 'Nome', value: 'name', sortable: true },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' },
      ]"
      :items="pdiCategoryStore.pdi_categories || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[
        { title: '10', value: 10 },
        { title: '25', value: 25 },
        { title: '50', value: 50 },
        { title: '100', value: 100 },
      ]"
      :items-length="pdiCategoryStore.total"
      :loading="pdiCategoryStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadPdiCategories"
    >
      <template #item.actions>
        <v-btn icon size="small" disabled>
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table-server>
  </v-container>
</template>
