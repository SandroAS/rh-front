<script setup lang="ts">
import { watch } from 'vue';
import { useForm, useField } from 'vee-validate';
import { useSectorStore } from '@/stores/sector.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type SectorPayload from '@/types/sector/sector-payload.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { getInitials } from '@/utils/getInitialsFromName.util';
import type Sector from '@/types/sector/sector.type';
import { useUserStore } from '@/stores/auth.store'

const sectorStore = useSectorStore();
const snackbarStore = useSnackbarStore();
const accountUserStore = useAccountUserStore();
const userStore = useUserStore();

const props = defineProps<{
  modelValue: boolean,
  selectedSector?: Sector | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

// Configurar formulário com useForm
const { handleSubmit, setValues, resetForm } = useForm({
  initialValues: {
    uuid: props.selectedSector?.uuid || undefined,
    name: props.selectedSector?.name || '',
    user_uuids: props.selectedSector?.users?.map(user => user.uuid) || []
  },
  validationSchema: {
    name: 'required'
  }
});

// Campos do formulário usando useField
const { value: name, errorMessage: nameError } = useField<string>('name', 'required');
const { value: userUuids, errorMessage: userUuidsError } = useField<string[]>('user_uuids');

// Watch para atualizar valores quando selectedSector mudar
watch(() => props.selectedSector, (val) => {
  if (val) {
    setValues({
      uuid: val.uuid || undefined,
      name: val.name || '',
      user_uuids: val.users?.map(user => user.uuid) || []
    });
  } else {
    resetForm({
      values: {
        uuid: undefined,
        name: '',
        user_uuids: []
      }
    });
  }
}, { immediate: true });

// Watch para resetar formulário quando modal fechar
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    // Resetar formulário quando modal fechar
    resetForm({
      values: {
        uuid: undefined,
        name: '',
        user_uuids: []
      }
    });
  }
});

// Submit handler
const onSubmit = handleSubmit(async (formValues) => {
  const payload: SectorPayload = {
    ...formValues as SectorPayload,
    createdBy: userStore.userAvatar!
  };

  try {
    await sectorStore.saveSector(payload, props.selectedSector?.uuid);
    snackbarStore.show('Setor salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(sectorStore.error || 'Falha ao salvar setor.', 'error');
  }
});
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <v-card>
      <v-card-title class="text-h6">
        {{ !!selectedSector ? 'Editar Setor' : 'Novo Setor' }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          label="Nome do Setor"
          variant="solo-filled"
          density="compact"
          :persistent-placeholder="!!props.selectedSector?.name"
          :error="!!nameError"
          :error-messages="nameError"
          class="mb-3"
        />

        <v-autocomplete
          v-model="userUuids"
          label="Usuários do Setor (Opcional)"
          :items="accountUserStore.accountUsersOptions"
          color="blue-grey-lighten-2"
          item-title="title"
          item-value="value"
          chips
          closable-chips
          multiple
          variant="solo-filled"
          :error="!!userUuidsError"
          :error-messages="userUuidsError"
        >
          <template v-slot:chip="{ props, item }">
            <v-chip
              v-bind="props"
              pill
              size="small"
              class="mt-1 pl-0"
            >
              <v-avatar v-if="item.raw.avatar" start class="ml-0">
                <v-img :src="item.raw.avatar"></v-img>
              </v-avatar>

              <v-avatar v-else color="primary" class="mr-1">
                <span class="text-white">{{ getInitials(item.raw.title) }}</span>
              </v-avatar>

              {{ item.raw.title }}
            </v-chip>
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item v-if="item.raw.avatar"
              v-bind="props"
              :prepend-avatar="item.raw.avatar"
              :title="item.raw.title"
              density="compact"
              max-height="10"
            ></v-list-item>
            <v-list-item v-else
              v-bind="props"
              :title="item.raw.title"
              density="compact"
              max-height="70"
              class="py-0"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="35">
                  <span class="text-white">{{ getInitials(item.raw.title) }}</span>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="onSubmit">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
