<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import UserModal from '../users/UserModal.vue'
import type AccountUser from '@/types/account/account-user.type'
import { useAccountUserStore } from '@/stores/account-user.store';
import { getInitials } from '@/utils/getInitialsFromName.util';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useRoleStore } from '@/stores/role-permission.store';

const accountUserStore = useAccountUserStore();
const snackbarStore = useSnackbarStore();
const roleStore = useRoleStore();

const dialog = ref(false);
const selectedAccountUser = ref<AccountUser | null>(null);

const currentPage = ref(accountUserStore.page);
const itemsPerPage = ref(accountUserStore.limit);
const searchTerm = ref(accountUserStore.search_term || '');

const openDialog = (item?: AccountUser) => {
  selectedAccountUser.value = item || null;
  dialog.value = true;
}

async function updateIsActive(accountUser: AccountUser) {
  try {
    await accountUserStore.updateAccountUserIsActive(accountUser.uuid!);
  } catch (err) {
    console.error(err);
    snackbarStore.show('Falha ao tentar ativar/inativar usuário. Erro: ' + err, 'error')
  }
}

async function loadItems({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy: any[] }) {
  const sortColumn = sortBy.length > 0 ? sortBy[0].key : undefined;
  const sortOrder = sortBy.length > 0 ? sortBy[0].order : undefined;
  const currentSearchTerm = searchTerm.value;

  let shouldFetch = false;

  if (page !== accountUserStore.page) {
    accountUserStore.page = page;
    shouldFetch = true;
  }

  if (itemsPerPage !== accountUserStore.limit) {
    accountUserStore.limit = itemsPerPage;
    accountUserStore.page = 1;
    shouldFetch = true;
  }

  if (sortColumn !== accountUserStore.sort_column || sortOrder !== accountUserStore.sort_order) {
    accountUserStore.sort_column = sortColumn;
    accountUserStore.sort_order = sortOrder;
    accountUserStore.page = 1;
    shouldFetch = true;
  }

  if (currentSearchTerm !== accountUserStore.search_term) {
    accountUserStore.search_term = currentSearchTerm;
    accountUserStore.page = 1; // Reseta a página ao aplicar novo filtro
    shouldFetch = true;
  }

  if (shouldFetch) {
    await accountUserStore.getAccountUsers({ page: accountUserStore.page, limit: accountUserStore.limit, sort_column: accountUserStore.sort_column, sort_order: accountUserStore.sort_order, search_term: accountUserStore.search_term });
  }

  if (!accountUserStore.account_users && !accountUserStore.loading) {
    await accountUserStore.getAccountUsers({ page: accountUserStore.page, limit: accountUserStore.limit, sort_column: accountUserStore.sort_column, sort_order: accountUserStore.sort_order, search_term: accountUserStore.search_term });
  }
}

let searchDebounceTimeout: ReturnType<typeof setTimeout>;

watch(searchTerm, (newVal, oldVal) => {
  if (newVal === oldVal) return;

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    accountUserStore.page = 1;
    loadItems({
      page: accountUserStore.page,
      itemsPerPage: accountUserStore.limit,
      sortBy: accountUserStore.sort_column ? [{ key: accountUserStore.sort_column, order: accountUserStore.sort_order || 'asc' }] : [],
    });
  }, 300);
});

onMounted(() => {
  loadItems({
    page: accountUserStore.page,
    itemsPerPage: accountUserStore.limit,
    sortBy: accountUserStore.sort_column ? [{ key: accountUserStore.sort_column, order: accountUserStore.sort_order || 'asc' }] : []
  });
});
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar usuário"
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
        Adicionar usuário
      </v-btn>
    </div>

    <v-data-table-server
      :headers="[
        { title: 'Nome', key: 'name', sortable: true },
        { title: 'Telefone', key: 'cellphone', align: 'end', sortable: true },
        { title: 'Tipo', key: 'role.name', align: 'end', sortable: true },
        { title: 'Status', key: 'is_active', align: 'end', sortable: true },
        { title: 'Editar', key: 'actions', sortable: false, align: 'end' }
      ]"
      :items="accountUserStore.account_users || []"
      item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
      :items-length="accountUserStore.total"
      :loading="accountUserStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadItems"
    >
      <template #item.name="{ item }">
        <div class="d-flex align-center gap-3 flex-row-reverse flex-md-row">
          <v-avatar color="primary" size="36" class="mr-2 ml-sm-2 mr-sm-0"> <template v-if="item.profile_img_url">
              <v-img :src="item.profile_img_url"></v-img>
            </template>
            <template v-else>
              {{ getInitials(item.name) }}
            </template>
          </v-avatar>
          <div class="text-md-left text-right text-left">
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #item.cellphone="{ item }">
        <div class="d-flex justify-end pr-2 text-caption"> {{ item.cellphone }}</div>
      </template>

      <template #item.role.name="{ item }">
        <div class="d-flex justify-end pr-2"> {{ roleStore.formatName(item.role.name) }}</div>
      </template>

      <template #item.is_active="{ item }">
        <div class="d-flex justify-md-start justify-end align-center flex-md-row-reverse" style="min-width: 132px;">
          <span class="text-subtitle-2 ml-md-2">
            {{ item.is_active ? 'Ativado' : 'Desativado' }}
          </span>
          <v-switch
            v-if="item.role.name !== 'ADMIN'"
            :model-value="item.is_active"
            :color="item.is_active ? 'green' : 'grey'"
            hide-details
            @change="updateIsActive(item)"
          ></v-switch>
        </div>
      </template>

      <template #item.actions="{ item }">
        <div v-if="item.role.name !== 'ADMIN'" class="d-flex justify-end"> <v-btn icon @click="openDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table-server>

    <UserModal v-model="dialog" :selectedAccountUser="selectedAccountUser" />
  </div>
</template>
