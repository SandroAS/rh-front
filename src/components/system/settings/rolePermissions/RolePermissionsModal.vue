<script setup lang="ts">
import { useRoleStore } from '@/stores/role-permission.store';
import type { Role } from '@/types/role/role.type';
import formatPermissionName from '@/utils/formatPermissionName.util';

const roleStore = useRoleStore();

const props = defineProps<{
  modelValue: boolean,
  selectedRole?: Role | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="600">
    <v-card>
      <v-card-title>
        Permissões do grupo: {{ roleStore.formatName(selectedRole!.name) }}
      </v-card-title>
      <v-card-text>
        <v-switch v-for="permission in roleStore!.permissions" :key="permission"
          :label="formatPermissionName(permission)" :model-value="selectedRole!.permissions.some(x => x === permission)"
          readonly color="primary" hide-details />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="close">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>