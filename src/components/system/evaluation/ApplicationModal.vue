<script setup lang="ts">
import { watch, ref, reactive } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
import { EvaluationApplicationStatus, EvaluationType, type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { getInitials } from '@/utils/getInitialsFromName.util';
import { type CreateEvaluationApplication, type EvaluationApplicationPayload } from '@/types/evaluationApplication/evaluation-application-payload.type';

const evaluationApplicationStore = useEvaluationApplicationStore();
const evaluationStore = useEvaluationStore();
const accountUserStore = useAccountUserStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean;
  selectedApplication?: EvaluationApplication | null;
}>();
const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
};

const evaluationApplicationFormData = reactive<EvaluationApplicationPayload>({
  uuid: props.selectedApplication?.uuid || undefined,
  evaluation_uuid: props.selectedApplication?.evaluation_uuid || '',
  evaluation: props.selectedApplication?.evaluation || undefined,
  started_date: props.selectedApplication?.started_date || new Date(),
  expiration_date: props.selectedApplication?.expiration_date || new Date(),
  status: props.selectedApplication?.status || EvaluationApplicationStatus.CREATED,
  applications: props.selectedApplication && props.selectedApplication.type
  ? [{
    type: props.selectedApplication.type,
    evaluated_user_uuid: props.selectedApplication.evaluated_user_uuid || '',
    evaluated_user: props.selectedApplication.evaluated_user || null,
    submitting_user_uuid: props.selectedApplication.submitting_user_uuid || '',
    submitting_user: props.selectedApplication.submitting_user || null,
  }] : [],
  type: props.selectedApplication?.type || undefined,
  evaluated_user_uuid: props.selectedApplication?.evaluated_user_uuid || undefined,
  evaluated_user: props.selectedApplication?.evaluated_user || undefined,
  submitting_user_uuid: props.selectedApplication?.submitting_user_uuid || undefined,
  submitting_user: props.selectedApplication?.submitting_user || undefined,
});

const creationMode = ref<'MANUAL' | '360'>('360');
const evaluated360UserUuid = ref<string[]>(props.selectedApplication ? [props.selectedApplication.evaluated_user_uuid || ''] : []);

const applicationTypeOptions = [
  { title: 'Autoavaliação', value: EvaluationType.SELF },
  { title: 'Avaliação por Pares', value: EvaluationType.PEER },
  { title: 'Avaliação por Líder', value: EvaluationType.LEADER },
  { title: 'Avaliação por Liderado', value: EvaluationType.SUBORDINATE },
];

let applicationsGrupedByEvaluated = reactive<CreateEvaluationApplication[][] | []>([]);

/**
 * Converte uma string de data (ISO) ou objeto Date para o formato YYYY-MM-DD.
 * Esta versão corrige o problema de "um dia a menos" ao lidar com strings UTC (Z).
 */
 const formatDateForInput = (dateSource: string | Date | undefined): string => {
  if (!dateSource) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  if (typeof dateSource === 'string') {
    const isoDatePart = dateSource.substring(0, 10);
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoDatePart)) {
      return isoDatePart;
    }
  }

  const d = new Date(dateSource);
  
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getInitialApplicationState = async (selectedApplication: EvaluationApplication | null): Promise<void> => {
  try {
    evaluationApplicationFormData.uuid = selectedApplication?.uuid || undefined;
    evaluationApplicationFormData.evaluation_uuid = selectedApplication?.evaluation_uuid || '';
    evaluationApplicationFormData.evaluation = selectedApplication?.evaluation || undefined;
    evaluationApplicationFormData.type = selectedApplication?.type || EvaluationType.SELF;
    evaluationApplicationFormData.evaluated_user_uuid = selectedApplication?.evaluated_user_uuid || '';
    evaluationApplicationFormData.evaluated_user = selectedApplication?.evaluated_user || null;
    evaluationApplicationFormData.submitting_user_uuid = selectedApplication?.submitting_user_uuid || '';
    evaluationApplicationFormData.submitting_user = selectedApplication?.submitting_user || null;

    evaluationApplicationFormData.started_date = formatDateForInput(selectedApplication?.started_date);
    evaluationApplicationFormData.expiration_date = formatDateForInput(selectedApplication?.expiration_date);

    evaluationApplicationFormData.status = selectedApplication?.status || EvaluationApplicationStatus.CREATED;

    if (selectedApplication) {
      setTimeout(() => {
        evaluationApplicationFormData.applications = [{
          type: selectedApplication?.type || EvaluationType.SELF,
          evaluated_user_uuid: selectedApplication?.evaluated_user_uuid || '',
          evaluated_user: selectedApplication?.evaluated_user || null,
          submitting_user_uuid: selectedApplication?.submitting_user_uuid || '',
          submitting_user: selectedApplication?.submitting_user || null,
        }];
        setTimeout(() => {
          const inputType = document.querySelector(`#applications_0_type`) as HTMLInputElement;
          if(inputType && selectedApplication?.type) {
            inputType.value = selectedApplication.type;
            inputType.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const inputEvaluatedUserUuid = document.querySelector(`#applications_0_evaluated_user_uuid`) as HTMLInputElement;
          if(inputEvaluatedUserUuid && selectedApplication?.evaluated_user_uuid) {
            inputEvaluatedUserUuid.value = selectedApplication.evaluated_user_uuid;
            inputEvaluatedUserUuid.dispatchEvent(new Event('change', { bubbles: true }));
            inputEvaluatedUserUuid.style.display = 'none';
          }
          const inputSubmittingUserUuid = document.querySelector(`#applications_0_submitting_user_uuid`) as HTMLInputElement;
          if(inputSubmittingUserUuid && selectedApplication?.submitting_user_uuid) {
            inputSubmittingUserUuid.value = selectedApplication.submitting_user_uuid;
            inputSubmittingUserUuid.dispatchEvent(new Event('change', { bubbles: true }));
            inputSubmittingUserUuid.style.display = 'none';
          }
        }, 50)
      }, 50)
    }
  } catch (err) {
    console.error(err);
  }
}

const addApplication = () => {
  if(evaluationApplicationFormData.applications) {
    evaluationApplicationFormData.applications.push({
      type: EvaluationType.SELF,
      evaluated_user_uuid: '',
      evaluated_user: null,
      submitting_user_uuid: '',
      submitting_user: null,
    });
  }
};

const removeApplication = (index: number) => {
  if (evaluationApplicationFormData?.applications?.length) {
    evaluationApplicationFormData?.applications.splice(index, 1);
  }
};

/**
 * Adiciona uma aplicação de avaliação ao payload, garantindo que não haja duplicação.
 * @param applications Array onde as aplicações serão adicionadas.
 * @param keySet Set para rastrear chaves únicas (Avaliador|Avaliado|Tipo).
 * @param submittingUuid UUID do Avaliador.
 * @param evaluatedUuid UUID do Avaliado.
 * @param type Tipo de Avaliação.
 */
const addUniqueApplication = (
  applications: EvaluationApplicationPayload['applications'],
  keySet: Set<string>,
  submittingUuid: string,
  evaluatedUuid: string,
  type: EvaluationType
) => {
  const key = `${submittingUuid}|${evaluatedUuid}|${type}`;

  if (!applications || keySet.has(key)) {
    return;
  }

  if (submittingUuid === evaluatedUuid && type !== EvaluationType.SELF) {
    return;
  }

  const submittingUser = accountUserStore.accountUsersOptionsTeams.find(user => user.value === submittingUuid) || null;
  const evaluatedUser = accountUserStore.accountUsersOptionsTeams.find(user => user.value === evaluatedUuid) || null;

  if (!submittingUser || !evaluatedUser) {
    console.warn(`Usuário não encontrado para Avaliador (${submittingUuid}) ou Avaliado (${evaluatedUuid})`);
    return;
  }

  applications.push({
    type: type,
    evaluated_user_uuid: evaluatedUuid,
    evaluated_user: {uuid: evaluatedUser.value, profile_img_url: evaluatedUser.avatar, name: evaluatedUser.title, email: ''}, 
    submitting_user_uuid: submittingUuid,
    submitting_user: {uuid: submittingUser.value, profile_img_url: submittingUser.avatar, name: submittingUser.title, email: ''}
  });
  keySet.add(key);
};

const generate360Applications = (evaluatedUuids: string[] | null) => {
  if (!evaluatedUuids || evaluatedUuids.length === 0) {
    evaluationApplicationFormData.applications = [];
    return;
  }

  const combinedApplications: EvaluationApplicationPayload['applications'] = [];
  const uniqueRelations = new Set<string>();

  evaluatedUuids.forEach(evaluatedUserUuid => {
    const evaluatedUser = accountUserStore.accountUsersOptionsTeams.find(
      user => user.value === evaluatedUserUuid
    );

    if (!evaluatedUser) {
      console.error(`Dados do usuário avaliado ${evaluatedUserUuid} não encontrados no store.`);
      return;
    }

    const teams = evaluatedUser.teams;

    if (!teams || teams.length === 0) {
      console.warn(`Nenhuma relação de time encontrada para ${evaluatedUser.title}.`);
    }

    // 1. Autoavaliação (Self)
    addUniqueApplication(
      combinedApplications,
      uniqueRelations,
      evaluatedUserUuid,
      evaluatedUserUuid,
      EvaluationType.SELF
    );

    teams.forEach(team => {
      const teamMembersUuids = team.teamMembers.map(tm => tm.user.uuid);
      const leaderUuid = team.leader.uuid;
      
      const staffMembersUuids = teamMembersUuids.filter(uuid => uuid !== leaderUuid);

      // --- A. CENÁRIO: O AVALIADO É O LÍDER ---
      if (evaluatedUserUuid === leaderUuid) {
        // Se eu sou o líder, todos os membros do time (staff) são meus SUBORDINADOS
        staffMembersUuids.forEach(subordinateUuid => {
          addUniqueApplication(
            combinedApplications,
            uniqueRelations,
            subordinateUuid,
            evaluatedUserUuid,
            EvaluationType.SUBORDINATE
          );
        });
      } 
      
      // --- B. CENÁRIO: O AVALIADO É UM MEMBRO (STAFF) ---
      else if (staffMembersUuids.includes(evaluatedUserUuid)) {
        
        // 1. O líder do time avalia o membro como LÍDER (Downward)
        addUniqueApplication(
          combinedApplications,
          uniqueRelations,
          leaderUuid,
          evaluatedUserUuid,
          EvaluationType.LEADER
        );

        // 2. Os outros membros do staff avaliam como PAR (Peer)
        staffMembersUuids.forEach(peerUuid => {
          // Só adiciona se for outro membro, diferente de mim mesmo
          if (peerUuid !== evaluatedUserUuid) {
            addUniqueApplication(
              combinedApplications,
              uniqueRelations,
              peerUuid,
              evaluatedUserUuid,
              EvaluationType.PEER
            );
          }
        });
      }
    });
  });

  evaluationApplicationFormData.applications = combinedApplications;

  applicationsGrupedByEvaluated = evaluatedUuids.map(userUuid => {
    return combinedApplications.filter(app => app.evaluated_user_uuid === userUuid);
  });

  const usersWithoutTeams = evaluatedUuids.filter(uuid => {
    const user = accountUserStore.accountUsersOptionsTeams.find(u => u.value === uuid);
    return user && (!user.teams || user.teams.length === 0);
  });

  if (usersWithoutTeams.length > 0) {
    const names = usersWithoutTeams
      .map(uuid => accountUserStore.accountUsersOptionsTeams.find(u => u.value === uuid)?.title)
      .join(', ');
    snackbarStore.show(`Usuário(s) sem time (${names}) não geraram todas as relações 360.`, 'warning');
  }
};

watch(() => props.selectedApplication, async (val) => {
  getInitialApplicationState(val ?? null)
}, { immediate: true });

watch(() => props.modelValue, async (val) => {
  if(val && !!props.selectedApplication?.uuid) {
    setTimeout(() => {
      const inputType = document.querySelector(`#applications_0_type`) as HTMLInputElement;
      if(inputType && props.selectedApplication?.type) {
        inputType.value = props.selectedApplication.type;
        inputType.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputEvaluatedUserUuid = document.querySelector(`#applications_0_evaluated_user_uuid`) as HTMLInputElement;
      if(inputEvaluatedUserUuid && props.selectedApplication?.evaluated_user_uuid) {
        inputEvaluatedUserUuid.value = props.selectedApplication.evaluated_user_uuid;
        inputEvaluatedUserUuid.dispatchEvent(new Event('change', { bubbles: true }));
        inputEvaluatedUserUuid.style.display = 'none';
      }
      const inputSubmittingUserUuid = document.querySelector(`#applications_0_submitting_user_uuid`) as HTMLInputElement;
      if(inputSubmittingUserUuid && props.selectedApplication?.submitting_user_uuid) {
        inputSubmittingUserUuid.value = props.selectedApplication.submitting_user_uuid;
        inputSubmittingUserUuid.dispatchEvent(new Event('change', { bubbles: true }));
        inputSubmittingUserUuid.style.display = 'none';
      }
    }, 50)
  }
}, { immediate: true });

watch(creationMode, (newMode) => {
  evaluationApplicationFormData.applications = [];
  evaluated360UserUuid.value = [];
});

watch(evaluated360UserUuid, (val) => {
  if(creationMode.value === '360') {
    generate360Applications(val);
  }
}, { deep: true });

async function onSubmit(formValues: Record<string, any>) {
  console.log('formValues', formValues)
  const applicationsToSave = evaluationApplicationFormData.applications || [];
  const payload = {
    uuid: evaluationApplicationFormData.uuid,
    evaluation_uuid: evaluationApplicationFormData.evaluation_uuid,
    started_date: evaluationApplicationFormData.started_date,
    expiration_date: evaluationApplicationFormData.expiration_date,
    status: evaluationApplicationFormData.status,
    applications: applicationsToSave.map(app => ({
      uuid: app.uuid,
      evaluation_uuid: evaluationApplicationFormData.evaluation_uuid,
      started_date: evaluationApplicationFormData.started_date,
      expiration_date: evaluationApplicationFormData.expiration_date,
      status: evaluationApplicationFormData.status,
      type: app.type,
      evaluated_user_uuid: app.evaluated_user_uuid,
      evaluated_user: app.evaluated_user,
      submitting_user_uuid: app.submitting_user_uuid,
      submitting_user: app.submitting_user
    })),
    evaluated_user_uuid: evaluationApplicationFormData.evaluated_user_uuid,
    submitting_user_uuid: evaluationApplicationFormData.submitting_user_uuid,
  }

  try {
    if (!!props.selectedApplication?.uuid) {
      await evaluationApplicationStore.saveEvaluationApplication(payload, props.selectedApplication.uuid);
      snackbarStore.show(`Aplicação de Avaliação atualizada com sucesso!`, 'success');
    } else {
      await evaluationApplicationStore.saveEvaluationApplication(payload);
      snackbarStore.show(`Aplicação(ões) de Avaliação criada(s) com sucesso!`, 'success');
    }
    close();
  } catch (err) {
    console.error('Erro ao salvar aplicação(ões) de avaliação:', err);
    snackbarStore.show('Erro ao salvar aplicação(ões).', 'error');
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="800px">
    <Form @submit="onSubmit" :initial-values="evaluationApplicationFormData">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!props.selectedApplication?.uuid ? 'Editar Aplicação de Avaliação' : 'Criar Nova Aplicação de Avaliação' }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" class="pb-0">
                <Field name="evaluation_uuid" label="Modelo de Avaliação" rules="required" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    v-model="evaluationApplicationFormData.evaluation_uuid"
                    :items="evaluationStore.evaluationOptions"
                    :item-props="true"
                    label="Modelo de Avaliação"
                    variant="solo-filled"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    :disabled="!!props.selectedApplication?.uuid"
                  ></v-select>
                </Field>
              </v-col>

              <v-col cols="12" sm="6">
                <Field name="started_date" label="Data de envio da aplicação" rules="required" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="evaluationApplicationFormData.started_date"
                    label="Data de envio da aplicação"
                    type="date"
                    variant="solo-filled"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    :disabled="props.selectedApplication?.status === EvaluationApplicationStatus.SENDED"
                  ></v-text-field>
                </Field>
              </v-col>
              <v-col cols="12" sm="6">
                <Field name="expiration_date" label="Disponível até" rules="required" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="evaluationApplicationFormData.expiration_date"
                    label="Disponível até"
                    type="date"
                    variant="solo-filled"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  ></v-text-field>
                </Field>
              </v-col>

              <v-divider v-if="!props.selectedApplication?.uuid"/>

              <v-col v-if="!props.selectedApplication?.uuid" cols="12" sm="12">
                <v-radio-group v-model="creationMode" hide-details>
                  <div class="d-flex gap-2">
                    <v-card
                      variant="tonal"
                      color="primary"
                      class="pa-4 w-100 border-blue-custom"
                    >
                      <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
                        <div>Criar aplicações 360 automaticamente</div>
                        <div>
                          <v-radio value="360"></v-radio>
                        </div>
                      </v-card-title>
                      <v-card-text class="pa-0">
                        <p class="mb-3 text-caption">Selecione o(s) usuário(s) que será(ão) avaliado(s). O sistema buscará automaticamente o Líder, Pares e Liderados deste usuário para gerar as aplicações necessárias.</p>
                        <Field name="bulk_evaluated_user_uuid" label="Usuário(s) Avaliado(s) (360)" :rules="{required: creationMode === '360'}" v-slot="{ field, errorMessage }">                          
                          <v-autocomplete
                            v-model="evaluated360UserUuid"
                            @update:model-value="(uuidValue: any) => {
                              const finalValue = Array.isArray(uuidValue) ? uuidValue.map(v => v.value || v) : (uuidValue ? [uuidValue.value || uuidValue] : []);
                              evaluated360UserUuid = finalValue.filter(Boolean);
                              field.onChange(evaluated360UserUuid);
                            }"
                            @blur="field.onBlur"
                            label="Selecione o(s) Avaliado(s)"
                            :items="accountUserStore.accountUsersOptionsTeams"
                            color="blue-grey-lighten-2"
                            item-title="title"
                            item-value="value"
                            variant="solo-filled"
                            chips
                            closable-chips
                            multiple
                            :error="!!errorMessage"
                            :error-messages="errorMessage"
                            :disabled="creationMode === 'MANUAL'"
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
                                :subtitle="item?.raw?.teams?.length ? item?.raw?.teams.map((t: any) => t.name).join(', ') : 'Sem time'"
                                density="compact"
                              ></v-list-item>
                              <v-list-item v-else
                                v-bind="props"
                                :title="item.raw.title"
                                :subtitle="item?.raw?.teams?.length ? item?.raw?.teams.map((t: any) => t.name).join(', ') : 'Sem time'"
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
                      </v-card-text>
                      <!-- DESCOBRIR O PQ CREATION MODE N TA FUNCIONADO DIREITO -->
                    </v-card>
                    <v-card
                      variant="outlined"
                      class="pa-4 w-100"
                      :border="creationMode === 'MANUAL' ? 'primary md' : 'gray sm'"
                    >
                      <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
                        <div>Criar aplicações manualmente</div>
                        <div>
                          <v-radio value="MANUAL"></v-radio>
                        </div>
                      </v-card-title>
                      <v-card-text class="pa-0">
                        <p class="mb-3 text-caption">Criar manualmente permite definir cada aplicação individualmente. Ideal para edição ou cenários não-padrão.</p>
                      </v-card-text>
                    </v-card>
                  </div>
                </v-radio-group>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-row v-if="creationMode === '360' && !props.selectedApplication?.uuid">
              <v-col cols="12" v-if="evaluationApplicationFormData?.applications?.length && evaluated360UserUuid.length > 0">
                <v-card v-for="evaluatedApplications in applicationsGrupedByEvaluated" variant="outlined" class="pa-4 border mb-2">
                  <p class="font-weight-medium mb-2">Aplicações Geradas para <b>{{ evaluatedApplications[0].evaluated_user?.name }}</b> :</p>
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item v-for="(app, index) in evaluatedApplications" :key="index" class="py-1">
                      <template #prepend>
                        <v-icon color="primary" size="small">mdi-file-document</v-icon>
                      </template>
                      <v-list-item-title class="text-caption">
                        <span class="font-weight-bold">{{ app.submitting_user?.name }}</span> ({{ applicationTypeOptions.find(opt => opt.value === app.type)?.title }}) avaliando <span class="font-weight-bold">{{ app.evaluated_user?.name }}</span>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
              <v-col cols="12" v-else-if="evaluated360UserUuid.length === 0 && !props.selectedApplication?.uuid">
                <v-alert type="info" variant="tonal" density="compact">Selecione um ou mais usuários para gerar automaticamente as aplicações 360.</v-alert>
              </v-col>
            </v-row>

            <v-row v-else>
              <v-col v-if="!props.selectedApplication?.uuid" cols="12" class="d-flex justify-space-between align-center">
                <h4 class="text-primary">Aplicações Manuais ({{ evaluationApplicationFormData?.applications?.length }})</h4>
                <v-btn color="primary" size="small" @click="addApplication" prepend-icon="mdi-plus-circle">
                  Adicionar Aplicação
                </v-btn>
              </v-col>

              <v-col cols="12" v-for="(app, index) in evaluationApplicationFormData?.applications" :key="index" class="py-2">
                <v-card variant="flat" class="pa-4 border">
                  <div v-if="!props.selectedApplication?.uuid" class="d-flex justify-space-between align-center mb-4">
                    <div class="text-subtitle-1">Aplicação #{{ index + 1 }}</div>
                    <v-btn v-if="evaluationApplicationFormData?.applications?.length"
                      icon="mdi-close"
                      variant="text"
                      size="small"
                      color="error"
                      @click="removeApplication(index)"
                    />
                  </div>

                  <v-row>
                    <v-col cols="12" sm="4">
                      <Field :name="`applications[${index}].type`" label="Tipo de Avaliação" rules="required" v-slot="{ field, errorMessage }">
                        <v-select
                          :id="`applications_${index}_type`"
                          v-bind="field"
                          v-model="app.type"
                          :items="applicationTypeOptions"
                          label="Tipo"
                          variant="solo-filled"
                          :error="!!errorMessage"
                          :error-messages="errorMessage"
                          :hide-details="!!props.selectedApplication?.uuid"
                          :disabled="!!props.selectedApplication?.uuid"
                        ></v-select>
                      </Field>
                    </v-col>

                    <v-col cols="12" sm="4">
                      <Field :name="`applications[${index}].evaluated_user_uuid`" label="Usuário Avaliado" rules="required" v-slot="{ field, errorMessage }">
                        <v-autocomplete
                          :id="`applications_${index}_evaluated_user_uuid`"
                          v-bind="field"
                          :model-value="app.evaluated_user_uuid"
                          @update:model-value="(uuidValue: any) => {
                            const finalValue = uuidValue?.value || uuidValue; 
                            app.evaluated_user_uuid = finalValue;
                            field.onChange(finalValue);
                          }"
                          label="Avaliado"
                          :items="accountUserStore.accountUsersOptionsTeams"
                          item-title="title"
                          item-value="value"
                          variant="solo-filled"
                          :error="!!errorMessage"
                          :error-messages="errorMessage"
                          :hide-details="!!props.selectedApplication?.uuid"
                          :disabled="!!props.selectedApplication?.uuid"
                        >
                          <template v-slot:selection="{ item }">
                            <div v-if="item?.raw?.value" class="d-flex align-center w-full">
                              <v-avatar 
                                v-if="item?.raw?.avatar" 
                                :image="item?.raw?.avatar" 
                                size="24" 
                                class="mr-2"
                              />
                              <v-avatar 
                                v-else 
                                color="primary" 
                                size="24" 
                                class="mr-2"
                              >
                                <span class="text-white text-caption">{{ getInitials(item.raw.title) }}</span>
                              </v-avatar>
                              <span class="text-body-2 font-weight-medium text-truncate">{{ item.raw.title }}</span>
                            </div>
                          </template>
                          <template v-slot:item="{ props, item }">
                            <v-list-item v-if="item.raw.avatar" v-bind="props" :prepend-avatar="item.raw.avatar" :title="item.raw.title" density="compact"></v-list-item>
                            <v-list-item v-else v-bind="props" :title="item.raw.title" density="compact" class="py-0">
                              <template v-slot:prepend>
                                <v-avatar color="primary" size="35"><span class="text-white">{{ getInitials(item.raw.title) }}</span></v-avatar>
                              </template>
                            </v-list-item>
                          </template>
                        </v-autocomplete>
                      </Field>
                    </v-col>

                    <v-col cols="12" sm="4">
                      <Field :name="`applications[${index}].submitting_user_uuid`" label="Usuário Avaliador" :rules="{required: app.type !== EvaluationType.SELF}" v-slot="{ field, errorMessage }">
                        <v-autocomplete
                          :id="`applications_${index}_submitting_user_uuid`"
                          v-bind="field"
                          :model-value="app.submitting_user_uuid"
                          @update:model-value="(uuidValue: any) => {
                            const finalValue = uuidValue?.value || uuidValue; 
                            app.submitting_user_uuid = finalValue;
                            field.onChange(finalValue);
                          }"
                          label="Avaliador"
                          :items="accountUserStore.accountUsersOptionsTeams"
                          item-title="title"
                          item-value="value"
                          :disabled="app.type === EvaluationType.SELF || !!props.selectedApplication?.uuid"
                          variant="solo-filled"
                          :error="!!errorMessage"
                          :error-messages="errorMessage"
                          :hide-details="!!props.selectedApplication?.uuid"
                        >
                          <template v-slot:selection="{ item }">
                            <div v-if="item?.raw?.value" class="d-flex align-center w-full">
                              <v-avatar 
                                v-if="item?.raw?.avatar" 
                                :image="item.raw.avatar" 
                                size="24" 
                                class="mr-2"
                              />
                              <v-avatar 
                                v-else 
                                color="primary" 
                                size="24" 
                                class="mr-2"
                              >
                                <span class="text-white text-caption">{{ getInitials(item.raw.title) }}</span>
                              </v-avatar>
                              <span class="text-body-2 font-weight-medium text-truncate">{{ item.raw.title }}</span>
                            </div>
                          </template>
                          <template v-slot:item="{ props, item }">
                            <v-list-item v-if="item.raw.avatar" v-bind="props" :prepend-avatar="item.raw.avatar" :title="item.raw.title" density="compact"></v-list-item>
                            <v-list-item v-else v-bind="props" :title="item.raw.title" density="compact" class="py-0">
                              <template v-slot:prepend>
                                <v-avatar color="primary" size="35"><span class="text-white">{{ getInitials(item.raw.title) }}</span></v-avatar>
                              </template>
                            </v-list-item>
                        </template>
                        </v-autocomplete>
                      </Field>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>

          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit" :disabled="!evaluationApplicationFormData?.applications?.length">
            <template v-if="!props.selectedApplication?.uuid">
              Salvar Aplicações ({{ evaluationApplicationFormData?.applications?.length }})
            </template>
            <template v-else>
              Salvar Aplicação
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
