<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useTeamStore } from '@/stores/team.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type TeamPayload from '@/types/team/team-payload.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useSectorStore } from '@/stores/sector.store';
import { getInitials } from '@/utils/getInitialsFromName.util';
import type Team from '@/types/team/team.type';
import { useUserStore } from '@/stores/auth.store'

const teamStore = useTeamStore();
const snackbarStore = useSnackbarStore();
const accountUserStore = useAccountUserStore();
const sectorStore = useSectorStore();
const userStore = useUserStore();

const props = defineProps<{
  modelValue: boolean,
  selectedTeam?: Team | null
}>();

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const currentLeader = ref(props.selectedTeam?.leader?.uuid || '');
const currentMembers = ref(props.selectedTeam?.teamMembers?.map(teamMember => teamMember.user.uuid) || []);

let team = reactive<TeamPayload>({
  uuid: props.selectedTeam?.uuid || undefined,
  createdBy: userStore.userAvatar!,
  name: props.selectedTeam?.name || '',
  leader: currentLeader.value,
  sector_uuid: props.selectedTeam?.sector?.uuid || undefined,
  member_uuids: currentMembers.value
});

function setLeaderFromItem(item: any): string {
  const uuidValue = item?.value ?? (typeof item === 'string' ? item : '');
  currentLeader.value = uuidValue;
  return uuidValue;
}

function setMembers(newValue: string[]) {
  currentMembers.value = newValue as any;
}

watch(() => props.selectedTeam, (val) => {
  currentLeader.value = val?.leader?.uuid || '';
  currentMembers.value = val?.teamMembers?.map(teamMember => teamMember.user.uuid) || [];
  
  Object.assign(team, {
    uuid: val?.uuid || undefined,
    name: val?.name || '',
    leader: currentLeader.value,
    sector_uuid: val?.sector?.uuid || undefined,
    member_uuids: currentMembers.value
  });
}, { immediate: true });

async function onSubmit(formValues: Record<string, any>) {
  const payload: TeamPayload = { ...formValues as TeamPayload, createdBy: userStore.userAvatar! };

  const leader = accountUserStore.accountUsersOptions.find(x => x.value === payload.leader);
  const leaderUserAvatar = { uuid: leader!.value, name: leader!.title, profile_img_url: leader?.avatar };

  let sector = undefined;
  if(payload.sector_uuid) {
    sector = sectorStore.sectorsOptions.find(x => x.value === payload.sector_uuid);
    sector = { uuid: sector!.value, name: sector!.title }
  }

  try {
    await teamStore.saveTeam(payload, leaderUserAvatar, sector, props.selectedTeam?.uuid);
    snackbarStore.show('Time salvo com sucesso!', 'success');
    close();
  } catch (err: any) {
    console.error('Erro no registro:', err);
    snackbarStore.show(teamStore.error || 'Falha ao salvar time.', 'error');
  }
};

watch(currentLeader, (newLeader, oldLeader) => {
  const members = new Set(currentMembers.value);

  if (newLeader) {
    members.add(newLeader);
  }

  if (oldLeader && newLeader !== oldLeader) {
    members.delete(oldLeader);
  }

  const newMembersArray = Array.from(members);
  
  if (currentMembers.value.length !== newMembersArray.length || 
      !newMembersArray.every(id => currentMembers.value.includes(id))) {
      
    currentMembers.value = newMembersArray;
  }
});


watch(currentMembers, (newMembers, oldMembers) => {
  const leaderId = currentLeader.value;
  
  if (leaderId && !newMembers.includes(leaderId)) {
    currentLeader.value = '';
    team.leader = '';
  }
});

function leaderOnBlur(field: any) {
  field.onBlur();
}
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

          <Field name="leader" label="Líder do Time" rules="required" v-slot="{ field, errorMessage }">
            <v-autocomplete
              :model-value="currentLeader"
              @update:model-value="(item: any) => {
                const uuidValue = setLeaderFromItem(item);
                field.onChange(uuidValue);
              }"
              @blur="leaderOnBlur(field)"
              label="Líder do Time"
              :items="accountUserStore.accountUsersOptions"
              color="blue-grey-lighten-2"
              item-title="title"
              item-value="value"
              variant="solo-filled"
              density="compact"
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-if="item.raw.avatar"
                  v-bind="props"
                  :prepend-avatar="item.raw.avatar"
                  :title="item.raw.title"
                  density="compact"
                ></v-list-item>
                <v-list-item v-else
                  v-bind="props"
                  :title="item.raw.title"
                  density="compact"
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

          <Field name="sector_uuid" label="Setor" v-slot="{ field, errorMessage }">
            <v-autocomplete
              v-bind="field"
              :model-value="field.value" 
              @update:model-value="field.onChange"
              label="Setor (Opcional)"
              :items="sectorStore.sectorsOptions"
              item-title="title"
              item-value="value"
              variant="solo-filled"
              density="compact"
              clearable
              :error="!!errorMessage"
              :error-messages="errorMessage"
              class="mb-3"
            />
          </Field>

          <Field name="member_uuids" label="Membros do Time" rules="required" v-slot="{ field, errorMessage }">
            <v-autocomplete
              :model-value="currentMembers" 
              @update:model-value="(newValue: any) => { 
                setMembers(newValue); 
                field.onChange(newValue); 
              }"
              label="Membros do Time"
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
