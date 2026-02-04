<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
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

const currentUsers = ref(props.selectedSector?.users?.map(user => user.uuid) || []);

let sector = reactive<SectorPayload>({
  uuid: props.selectedSector?.uuid || undefined,
  createdBy: userStore.userAvatar!,
  name: props.selectedSector?.name || '',
  user_uuids: currentUsers.value
});

function setUsers(newValue: string[]) {
  currentUsers.value = newValue as any;
}

watch(() => props.selectedSector, (val) => {
  currentUsers.value = val?.users?.map(user => user.uuid) || [];
  
  Object.assign(sector, {
    uuid: val?.uuid || undefined,
    name: val?.name || '',
    user_uuids: currentUsers.value
  });
}, { immediate: true });

async function onSubmit(formValues: Record<string, any>) {
  const payload: SectorPayload = { ...formValues as SectorPayload, createdBy: userStore.userAvatar! };

  try {
    await sectorStore.saveSector(payload, props.selectedSector?.uuid);
    snackbarStore.show('Setor salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(sectorStore.error || 'Falha ao salvar setor.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="sector">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedSector ? 'Editar Setor' : 'Novo Setor' }}
        </v-card-title>
        <v-card-text>
          <Field name="name" label="Nome do Setor" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome do Setor"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedSector?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>

          <Field name="user_uuids" label="Usuários do Setor" v-slot="{ field, errorMessage }">
            <v-autocomplete
              :model-value="currentUsers" 
              @update:model-value="(newValue: any) => { 
                setUsers(newValue); 
                field.onChange(newValue); 
              }"
              label="Usuários do Setor (Opcional)"
              :items="accountUserStore.accountUsersOptions"
              color="blue-grey-lighten-2"
              item-title="title"
              item-value="value"
              chips
              closable-chips
              multiple
              variant="solo-filled"
              :error="!!errorMessage"
              :error-messages="errorMessage"
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
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
