<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { usePdiStore } from '@/stores/pdi.store';
import { useAccountUserStore } from '@/stores/account-user.store';
import loadItems from '@/utils/loadItems.util';
import type Pdi from '@/types/pdi/pdi.type';
import { PdiStatus } from '@/types/pdi/pdi.type';
import PdiModal from '../PdiModal.vue';
import { formatDate } from '@/utils/formatDate.util';

const pdiStore = usePdiStore();
const accountUserStore = useAccountUserStore();

const PDI_STATUS_LABELS: Record<string, string> = {
  [PdiStatus.NOT_STARTED]: 'Não iniciado',
  [PdiStatus.IN_PROGRESS]: 'Em progresso',
  [PdiStatus.PARTIALLY_COMPLETED]: 'Parcialmente concluído',
  [PdiStatus.COMPLETED]: 'Concluído',
  [PdiStatus.CANCELLED]: 'Cancelado',
};

const PDI_STATUS_COLORS: Record<string, string> = {
  [PdiStatus.NOT_STARTED]: 'warning',
  [PdiStatus.IN_PROGRESS]: 'amber',
  [PdiStatus.PARTIALLY_COMPLETED]: 'lime',
  [PdiStatus.COMPLETED]: 'success',
  [PdiStatus.CANCELLED]: 'grey',
};

function getStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return PDI_STATUS_LABELS[status] ?? status;
}

function getStatusColor(status: string | null | undefined): string {
  if (!status) return 'grey';
  return PDI_STATUS_COLORS[status] ?? 'grey';
}

function getUserNameByUuid(userUuid: string | null | undefined): string {
  if (!userUuid) return '—';
  const user = accountUserStore.all_account_users?.find((u) => u.uuid === userUuid);
  return user?.name ?? userUuid;
}

const dialog = ref(false);
const selectedPdi = ref<Pdi | null>(null);

async function openDialog(item?: Pdi) {
  if (item?.uuid) {
    try {
      const full = await pdiStore.getPdi(item.uuid);
      selectedPdi.value = full;
    } catch {
      selectedPdi.value = item;
    }
  } else {
    selectedPdi.value = null;
  }
  dialog.value = true;
}

const currentPage = ref(pdiStore.page);
const itemsPerPage = ref(pdiStore.limit);
const searchTerm = ref(pdiStore.search_term || '');
const sortBy = ref(
  pdiStore.sort_column ? [{ key: pdiStore.sort_column, order: pdiStore.sort_order || 'asc' }] : []
);

const loadPdis = async ({
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
    pdiStore,
    'getPdis',
    'pdis'
  );

  currentPage.value = pdiStore.page;
  itemsPerPage.value = pdiStore.limit;
  if (pdiStore.sort_column) {
    sortBy.value = [{ key: pdiStore.sort_column, order: pdiStore.sort_order || 'asc' }];
  } else {
    sortBy.value = [];
  }
};

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal) => {
  if (typeof newVal !== 'string') return;
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadPdis({
      page: pdiStore.page,
      itemsPerPage: pdiStore.limit,
      sortBy: pdiStore.sort_column ? [{ key: pdiStore.sort_column, order: pdiStore.sort_order || 'asc' }] : [],
    });
  }, 300);
});

onMounted(async () => {
  await accountUserStore.getAllAccountUsersWithTeams?.().catch(() => {});
  loadPdis({
    page: pdiStore.page,
    itemsPerPage: pdiStore.limit,
    sortBy: pdiStore.sort_column ? [{ key: pdiStore.sort_column, order: pdiStore.sort_order || 'asc' }] : [],
  });
});
</script>

<template>
  <v-container fluid>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar PDI"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        density="compact"
        hide-details
        clearable
        class="mb-4 mb-md-0 w-md-auto w-100"
        style="max-width: 300px;"
      />

      <v-btn color="primary" class="w-md-auto w-100" @click="openDialog()">
        <v-icon start>mdi-plus</v-icon>
        Adicionar PDI
      </v-btn>
    </div>

    <v-data-table-server
      :headers="[
        { title: 'Colaborador', value: 'user_uuid', sortable: true },
        { title: 'Início', value: 'start_date', sortable: true },
        { title: 'Fim', value: 'end_date', sortable: true },
        { title: 'Status', value: 'status', sortable: true },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' },
      ]"
      :items="pdiStore.pdis || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[
        { title: '10', value: 10 },
        { title: '25', value: 25 },
        { title: '50', value: 50 },
        { title: '100', value: 100 },
      ]"
      :items-length="pdiStore.total"
      :loading="pdiStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadPdis"
    >
      <template #item.user_uuid="{ item }">
        {{ getUserNameByUuid(item?.user_uuid) }}
      </template>
      <template #item.start_date="{ item }">
        {{ item?.start_date ? formatDate(item.start_date) : '—' }}
      </template>
      <template #item.end_date="{ item }">
        {{ item?.end_date ? formatDate(item.end_date) : '—' }}
      </template>
      <template #item.status="{ item }">
        <v-chip
          v-if="item?.status"
          :color="getStatusColor(item.status)"
          size="small"
          variant="tonal"
        >
          {{ getStatusLabel(item.status) }}
        </v-chip>
        <span v-else>—</span>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon size="small" @click="openDialog(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table-server>

    <PdiModal
      v-model="dialog"
      :selected-pdi="selectedPdi"
      @saved="loadPdis({
        page: pdiStore.page,
        itemsPerPage: pdiStore.limit,
        sortBy: pdiStore.sort_column ? [{ key: pdiStore.sort_column, order: pdiStore.sort_order || 'asc' }] : [],
      })"
    />
  </v-container>
</template>
