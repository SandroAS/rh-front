<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useTeamStore } from '@/stores/team.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type TeamPayload from '@/types/team/team-payload.type';
import type Team from '@/types/team/team.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { getInitials } from '@/utils/getInitialsFromName.util';

const teamStore = useTeamStore();
const snackbarStore = useSnackbarStore();
const accountUserStore = useAccountUserStore();

const props = defineProps<{
  modelValue: boolean,
  selectedTeam?: Team | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

let team = reactive<TeamPayload>({
  uuid: props.selectedTeam?.uuid || undefined,
  name: props.selectedTeam?.name || '',
  users: props.selectedTeam?.users || []
});

watch(() => props.selectedTeam, (val) => {
  team.uuid = val?.uuid || undefined;
  team.name = val?.name || '';
  team.users = val?.users || [];
}, { immediate: true });

async function onSubmit(formValues: Record<string, any>) {
  const payload: TeamPayload = formValues as TeamPayload;

  try {
    await teamStore.saveTeam(payload, props.selectedTeam?.uuid);
    snackbarStore.show('Time salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(teamStore.error || 'Falha ao salvar time.', 'error');
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <Form @submit="onSubmit" :initial-values="team">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedTeam ? 'Editar Time' : 'Novo Time' }}
        </v-card-title>
        <v-card-text>
          <Field name="name" label="Nome do Time" rules="required" v-slot="{ field, errorMessage }">
            <v-text-field
              v-bind="field"
              label="Nome do Time"
              variant="solo-filled"
              density="compact"
              :persistent-placeholder="!!props.selectedTeam?.name"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>

          <Field name="users" label="Membros do Time" rules="required" v-slot="{ field, errorMessage }">
            <v-autocomplete
              :model-value="field.value" 
              @update:model-value="field.onChange"
              :items="accountUserStore.accountUsersOptions"
              color="blue-grey-lighten-2"
              item-title="name"
              item-value="uuid"
              label="Select"
              chips
              closable-chips
              multiple
              variant="solo-filled"
              density="compact"
              :error="!!errorMessage"
              :error-messages="errorMessage"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip v-if="item.raw.avatar"
                  v-bind="props"
                  :prepend-avatar="item.raw.avatar"
                  :text="item.raw.title"
                ></v-chip>

                <v-chip v-else
                  v-bind="props"
                  :text="item.raw.title"
                  class="pl-1"
                >
                  <v-avatar color="primary" class="mr-1">
                    <span class="text-white">{{ getInitials(item.raw.title) }}</span>
                  </v-avatar>
                  <span>{{ item.raw.title }}</span>
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
