<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDRDStore } from '@/stores/drd.store';
import loadItems from '@/utils/loadItems.util';
import DRDModal from '@/components/system/drd/DRDModal.vue';
import { useJobPositionStore } from '@/stores/job-position.store';
import { getInitials } from '@/utils/getInitialsFromName.util';
import type DRDSimple from '@/types/drd/drd-simple.type';

const DRDStore = useDRDStore();
const jobPositionStore = useJobPositionStore();

const dialog = ref(false);
const selectedDRD = ref<DRDSimple | null>(null);

const currentPage = ref(DRDStore.page);
const itemsPerPage = ref(DRDStore.limit);
const searchTerm = ref(DRDStore.search_term || '');
const sortBy = ref(DRDStore.sort_column ? [{ key: DRDStore.sort_column, order: DRDStore.sort_order }] : []);

const openDialog = (item?: DRDSimple) => {
  selectedDRD.value = item || null;
  dialog.value = true;
}

async function getAllJobPositions() {
  await jobPositionStore.getAllJobPositions();
}

getAllJobPositions();

const loadDRDs = async ({ page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam }: { page: number, itemsPerPage: number, sortBy: any[] }) => {
  currentPage.value = page;
  itemsPerPage.value = itemsPerPageParam;
  sortBy.value = sortByParam;

  await loadItems(
    { page, itemsPerPage: itemsPerPageParam, sortBy: sortByParam },
    searchTerm.value,
    DRDStore,
    'getDRDs',
    'drds'
  );

  currentPage.value = DRDStore.page;
  itemsPerPage.value = DRDStore.limit;

  if (DRDStore.sort_column) {
    sortBy.value = [{ key: DRDStore.sort_column, order: DRDStore.sort_order || 'asc' }];
  } else {
    sortBy.value = [];
  }
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return; 

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadDRDs({
      page: DRDStore.page,
      itemsPerPage: DRDStore.limit,
      sortBy: DRDStore.sort_column ? [{ key: DRDStore.sort_column, order: DRDStore.sort_order || 'asc' }] : []
    });
  }, 300);
});

onMounted(() => {
  loadDRDs({
    page: DRDStore.page,
    itemsPerPage: DRDStore.limit,
    sortBy: DRDStore.sort_column ? [{ key: DRDStore.sort_column, order: DRDStore.sort_order || 'asc' }] : []
  });
});
</script>

<template>
  <v-container fluid>
    <h2 class="mb-6">Descritivo de Resultado e Desempenho</h2>

    <p class="text-caption mb-6">O DRD (Descritivo de Resultados e Desempenho) é um documento que detalha de forma clara e objetiva as responsabilidades, entregas esperadas e indicadores de desempenho de um cargo dentro da organização. Diferente de uma simples descrição de funções, o DRD tem foco em resultados mensuráveis e competências comportamentais e técnicas necessárias para o bom desempenho do profissional. Ele serve como base para a avaliação de performance, o planejamento de metas individuais, e o alinhamento entre expectativas da empresa e contribuições do colaborador, promovendo maior transparência e assertividade na gestão de pessoas.</p>
    
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

    <v-data-table-server
      :headers="[
        { title: 'Cargo', value: 'jobPosition.title', sortable: true },
        { title: 'Criado por', value: 'createdByUser', sortable: true },
        { title: 'Escala do DRD', value: 'rate', align: 'end' },
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
      <template #item.createdByUser="{ item }">
        <div class="d-flex align-center gap-3 flex-row-reverse flex-md-row">
          <v-avatar color="primary" size="36" class="mr-2 ml-sm-2 mr-sm-0">
            <template v-if="item.createdByUser?.profile_img_url">
              <v-img :src="item.createdByUser.profile_img_url"></v-img>
            </template>
            <template v-else>
              {{ getInitials(item.createdByUser?.name) }}
            </template>
          </v-avatar>
          <div class="text-md-left text-right text-left">
            <div class="font-weight-medium">{{ item.createdByUser?.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.createdByUser?.email }}</div>
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

    <DRDModal v-model="dialog" :selectedDRD="selectedDRD" />
  </v-container>
</template>
