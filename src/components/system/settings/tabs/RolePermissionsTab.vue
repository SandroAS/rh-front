<script setup lang="ts">
import type { Role } from '@/types/role/role.type'
import { onMounted, ref, watch } from 'vue'
import { useRoleStore } from '@/stores/role-permission.store';
import { formatDate } from '@/utils/formatDate.util';
import RolePermissionsModal from '../rolePermissions/RolePermissionsModal.vue';

const roleStore = useRoleStore();

const dialog = ref(false);
const selectedRole = ref<Role | null>(null)

const currentPage = ref(roleStore.page);
const itemsPerPage = ref(roleStore.limit);
const searchTerm = ref(roleStore.search_term || '');

const openDialog = (item?: Role) => {
  selectedRole.value = item || null;
  dialog.value = true;
}

async function getRolePermissions() {
  await roleStore.getPermissions();
  await roleStore.getRolesPermissions();
}

getRolePermissions();

async function loadItems({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy: any[] }) {
  const sortColumn = sortBy.length > 0 ? sortBy[0].key : undefined;
  const sortOrder = sortBy.length > 0 ? sortBy[0].order : undefined;
  const currentSearchTerm = searchTerm.value;

  let shouldFetch = false;

  if (page !== roleStore.page) {
    roleStore.page = page;
    shouldFetch = true;
  }

  if (itemsPerPage !== roleStore.limit) {
    roleStore.limit = itemsPerPage;
    roleStore.page = 1;
    shouldFetch = true;
  }

  if (sortColumn !== roleStore.sort_column || sortOrder !== roleStore.sort_order) {
    roleStore.sort_column = sortColumn;
    roleStore.sort_order = sortOrder;
    roleStore.page = 1;
    shouldFetch = true;
  }

  if (currentSearchTerm !== roleStore.search_term) {
    roleStore.search_term = currentSearchTerm;
    roleStore.page = 1;
    shouldFetch = true;
  }

  if (shouldFetch) {
    await roleStore.getRolesPermissions({ page: roleStore.page, limit: roleStore.limit, sort_column: roleStore.sort_column, sort_order: roleStore.sort_order, search_term: roleStore.search_term });
  }

  if (!roleStore.roles && !roleStore.loading) {
    await roleStore.getRolesPermissions({ page: roleStore.page, limit: roleStore.limit, sort_column: roleStore.sort_column, sort_order: roleStore.sort_order, search_term: roleStore.search_term });
  }
}

let searchDebounceTimeout: ReturnType<typeof setTimeout>;
watch(searchTerm, (newVal, oldVal) => {
  if (newVal === oldVal) return;

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    roleStore.page = 1;
    loadItems({
      page: roleStore.page,
      itemsPerPage: roleStore.limit,
      sortBy: roleStore.sort_column ? [{ key: roleStore.sort_column, order: roleStore.sort_order || 'asc' }] : [],
    });
  }, 300);
});

onMounted(() => {
  loadItems({
    page: roleStore.page,
    itemsPerPage: roleStore.limit,
    sortBy: roleStore.sort_column ? [{ key: roleStore.sort_column, order: roleStore.sort_order || 'asc' }] : []
  });
});
</script>

<template>
  <div>
    <div class="flex-column flex-md-row d-flex justify-space-between mb-4 mt-2 align-center">
      <v-text-field
        v-model="searchTerm"
        label="Buscar grupo de permissões"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        density="compact"
        hide-details
        clearable
        class="mb-4 mb-md-0 w-md-auto w-100"
        style="max-width: 300px;"
      ></v-text-field>
    </div>

    <v-data-table
      :headers="[
        { title: 'Grupo', value: 'name', sortable: true },
        { title: 'Data de Cadastro', value: 'created_at', sortable: true },
        { title: 'Ações', value: 'actions', sortable: false, align: 'end' }
      ]"
      :items="roleStore.roles || []" item-value="uuid"
      :items-per-page="itemsPerPage"
      :items-per-page-options="[{ title: '10', value: 10 }, { title: '25', value: 25 }, { title: '50', value: 50 }, { title: '100', value: 100 }]"
      :items-length="roleStore.total"
      :loading="roleStore.loading"
      :page="currentPage"
      mobile-breakpoint="md"
      @update:options="loadItems"
    >
      <template #item.name="{ item }">
        {{ roleStore.formatName(item.name) }}
      </template>

      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn icon @click="openDialog(item)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <RolePermissionsModal v-model="dialog" :selectedRole="selectedRole" />
  </div>
</template>
