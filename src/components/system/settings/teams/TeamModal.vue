<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useTeamStore } from '@/stores/team.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type TeamPayload from '@/types/team/team-payload.type';
import type Team from '@/types/team/team.type';
import { useAccountUserStore } from '@/stores/account-user.store';

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
              v-bind="field"
              label="Selecione os Membros"
              :items="accountUserStore.accountUsersOptions"
              item-title="title"
              item-value="value"
              :return-object="true"
              multiple
              chips
              closable-chips
              clearable
              variant="solo-filled"
              density="compact"
              :error="!!errorMessage"
              :error-messages="errorMessage"
            >
              <template v-slot:item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps" :title="item.raw.title" />
                </template>
              
              <template v-slot:chip="{ item, props: chipProps }">
                <v-chip v-bind="chipProps">
                  {{ item.raw.title }} </v-chip>
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
