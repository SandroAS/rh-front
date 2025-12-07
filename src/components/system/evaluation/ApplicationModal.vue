<script setup lang="ts">
import { watch, computed, ref, reactive } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useEvaluationApplicationStore } from '@/stores/evaluation.application.store';
import { EvaluationApplicationStatus, EvaluationType, type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { getInitials } from '@/utils/getInitialsFromName.util';
import { type EvaluationApplicationPayload } from '@/types/evaluationApplication/evaluation-application-payload.type';

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
  applications: props.selectedApplication ? [{
    type: EvaluationType.SELF,
    evaluated_user_uuid: '',
    evaluated_user: null,
    submitting_user_uuid: '',
    submitting_user: null,
  }] : undefined,
  type: props.selectedApplication?.type || undefined,
  evaluated_user_uuid: props.selectedApplication?.evaluated_user_uuid || undefined,
  evaluated_user: props.selectedApplication?.evaluated_user || undefined,
  submitting_user_uuid: props.selectedApplication?.submitting_user_uuid || undefined,
  submitting_user: props.selectedApplication?.submitting_user || undefined,
});

const creationMode = ref<'MANUAL' | '360'>('360');
const evaluated360UserUuid = ref<string | null>(null);

const applicationTypeOptions = [
  { title: 'Autoavaliação', value: EvaluationType.SELF },
  { title: 'Avaliação por Pares', value: EvaluationType.PEER },
  { title: 'Avaliação por Líder', value: EvaluationType.LEADER },
  { title: 'Avaliação por Liderado', value: EvaluationType.SUBORDINATE },
];

const getInitialApplicationState = async (selectedApplication: EvaluationApplication | null): Promise<void> => {  
  try {
    let fetchedEvaluationApplication: EvaluationApplication | undefined;

    if (selectedApplication?.uuid) {
      fetchedEvaluationApplication = await evaluationApplicationStore.getEvaluationApplication(selectedApplication.uuid);
    }

    evaluationApplicationFormData.uuid = fetchedEvaluationApplication?.uuid || undefined;
    evaluationApplicationFormData.evaluation_uuid = fetchedEvaluationApplication?.evaluation_uuid || '';
    evaluationApplicationFormData.evaluation = fetchedEvaluationApplication?.evaluation || undefined;
    evaluationApplicationFormData.type = fetchedEvaluationApplication?.type || EvaluationType.SELF;
    evaluationApplicationFormData.evaluated_user_uuid = fetchedEvaluationApplication?.evaluated_user_uuid || '';
    evaluationApplicationFormData.evaluated_user = fetchedEvaluationApplication?.evaluated_user || null;
    evaluationApplicationFormData.submitting_user_uuid = fetchedEvaluationApplication?.submitting_user_uuid || '';
    evaluationApplicationFormData.submitting_user = fetchedEvaluationApplication?.submitting_user || null;
    evaluationApplicationFormData.started_date = fetchedEvaluationApplication?.started_date || new Date();
    evaluationApplicationFormData.expiration_date = fetchedEvaluationApplication?.expiration_date || new Date();
    evaluationApplicationFormData.status = fetchedEvaluationApplication?.status || EvaluationApplicationStatus.CREATED;

    if(evaluationApplicationFormData) {
      // setTimeout(() => {
      //   const inputName = document.querySelector(`#evaluation_name`) as HTMLInputElement;
      //   if(inputName && evaluationApplicationFormData?.name) {
      //     inputName.value = evaluationApplicationFormData.name;
      //     inputName.dispatchEvent(new Event('change', { bubbles: true }));
      //   }
  
      //   const inputDescription = document.querySelector(`#evaluation_description`) as HTMLInputElement;
      //   if(inputDescription && evaluationApplicationFormData?.description) {
      //     inputDescription.value = evaluationApplicationFormData.description;
      //     inputDescription.dispatchEvent(new Event('change', { bubbles: true }));
      //   }

      //   const inputDrdUuid = document.querySelector(`#evaluation_drd_uuid`) as HTMLInputElement;
      //   if(inputDrdUuid && evaluationApplicationFormData?.drd_uuid) {
      //     inputDrdUuid.value = evaluationApplicationFormData.drd_uuid;
      //     inputDrdUuid.dispatchEvent(new Event('change', { bubbles: true }));
      //   }
      // }, 50)
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

const generate360Applications = (evaluatedUuid: string) => {
  evaluationApplicationFormData.applications = [];
  // AJUSTAR LOGICA DO 360...
  const relations = null;

  // if (!relations) {
  //   snackbarStore.show('Nenhuma relação encontrada para o usuário selecionado, vincule ele a um time antes.', 'warning');
  //   evaluationApplicationFormData.applications = [];
  //   return;
  // }

  // 1. Autoavaliação (Self)
  evaluationApplicationFormData.applications.push({
    type: EvaluationType.SELF,
    evaluated_user_uuid: evaluatedUuid,
    evaluated_user: null,
    submitting_user_uuid: evaluatedUuid,
    submitting_user: null
  });

  // 2. Avaliação por Líder (Leader)
  // if (relations.leader) {
    evaluationApplicationFormData.applications.push({
      type: EvaluationType.LEADER,
      evaluated_user_uuid: evaluatedUuid,
      evaluated_user: null,
      submitting_user_uuid: '',
      submitting_user: null
    });
  // }

  // 3. Avaliação por Liderado (Subordinate)
  // relations.subordinates.forEach(subordinateUuid => {
    evaluationApplicationFormData.applications.push({
      type: EvaluationType.SUBORDINATE,
      evaluated_user_uuid: evaluatedUuid,
      evaluated_user: null,
      submitting_user_uuid: '',
      submitting_user: null
    });
  // });

  // 4. Avaliação por Par (Peer)
  // relations.peers.forEach(peerUuid => {
    evaluationApplicationFormData.applications.push({
      type: EvaluationType.PEER,
      evaluated_user_uuid: evaluatedUuid,
      evaluated_user: null,
      submitting_user_uuid: '',
      submitting_user: null
    });
  // });

  snackbarStore.show(`${evaluationApplicationFormData.applications.length} aplicações 360 geradas com sucesso.`, 'info');
};

watch(() => props.selectedApplication, async (val) => {
  getInitialApplicationState(val ?? null)
}, { immediate: true });

watch(creationMode, (newMode) => {
  evaluationApplicationFormData.applications = [{
    type: EvaluationType.SELF,
    evaluated_user_uuid: '',
    evaluated_user: null,
    submitting_user_uuid: '',
    submitting_user: null,
  }];
  evaluated360UserUuid.value = null;
});

watch(evaluated360UserUuid, (val) => {
  if(val) generate360Applications(val);
});

async function onSubmit(formValues: Record<string, any>) {
  const payload = evaluationApplicationFormData?.applications?.length
    ? evaluationApplicationFormData?.applications?.map(app => ({
        uuid: undefined,
        evaluation_uuid: evaluationApplicationFormData.evaluation_uuid,
        evaluatio: evaluationApplicationFormData.evaluation,
        started_date: evaluationApplicationFormData.started_date,
        expiration_date: evaluationApplicationFormData.expiration_date,
        status: evaluationApplicationFormData.status,
        type: app.type,
        evaluated_user_uuid: app.evaluated_user_uuid,
        evaluated_user: app.evaluated_user,
        submitting_user_uuid: app.submitting_user_uuid,
        submitting_user: app.submitting_user
      }))
    : [{
        uuid: evaluationApplicationFormData?.uuid,
        evaluation_uuid: evaluationApplicationFormData?.evaluation_uuid,
        evaluation: evaluationApplicationFormData?.evaluation,
        started_date: evaluationApplicationFormData?.started_date,
        expiration_date: evaluationApplicationFormData?.expiration_date,
        status: evaluationApplicationFormData?.status,
        type: evaluationApplicationFormData?.type,
        evaluated_user_uuid: evaluationApplicationFormData?.evaluated_user_uuid,
        evaluated_user: evaluationApplicationFormData?.evaluated_user,
        submitting_user_uuid: evaluationApplicationFormData?.submitting_user_uuid,
        submitting_user: evaluationApplicationFormData?.submitting_user,
      }];

  try {
    if (!!props.selectedApplication) {
      await evaluationApplicationStore.saveEvaluationApplication(payload, props.selectedApplication.uuid);
      snackbarStore.show('Aplicação atualizada com sucesso!', 'success');
    } else {
      await evaluationApplicationStore.saveEvaluationApplication(payload);
      snackbarStore.show(`${evaluationApplicationFormData?.applications?.length} Aplicações de Avaliação criadas com sucesso!`, 'success');
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
          {{ !!props.selectedApplication ? 'Editar Aplicação de Avaliação' : 'Criar Nova Aplicação de Avaliação' }}
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
                  ></v-select>
                </Field>
              </v-col>

              <v-col cols="12" sm="6">
                <Field name="started_date" label="Data de Aplicação" rules="required" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="evaluationApplicationFormData.started_date"
                    label="Data de Aplicação"
                    type="date"
                    variant="solo-filled"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
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


              <v-divider />

              <v-col cols="12" sm="12">
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
                        <p class="mb-3 text-caption">Selecione o usuário que será avaliado. O sistema buscará automaticamente o Líder, Pares e Liderados deste usuário para gerar as aplicações necessárias.</p>

                        <Field name="bulk_evaluated_user_uuid" label="Usuário Avaliado (360)" rules="required" v-slot="{ field, errorMessage }">
                          <v-autocomplete
                            v-model="evaluated360UserUuid"
                            @update:model-value="(uuidValue: any) => {
                              evaluated360UserUuid = uuidValue?.value || uuidValue;
                              field.onChange(evaluated360UserUuid);
                            }"
                            @blur="field.onBlur"
                            label="Selecione o Avaliado"
                            :items="accountUserStore.accountUsersOptions"
                            color="blue-grey-lighten-2"
                            item-title="title"
                            item-value="value"
                            variant="solo-filled"
                            :error="!!errorMessage"
                            :error-messages="errorMessage"
                          >
                            <template v-slot:selection="{ item }">
                              <div v-if="item.value" class="d-flex align-center w-full">
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
                      </v-card-text>
                    </v-card>
                    <v-card
                      variant="outlined"
                      class="pa-4 w-100"
                      :border="evaluated360UserUuid ? 'primary md' : 'gray sm'"
                    >
                      <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
                        <div>Criar aplicações manualmente</div>
                        <div>
                          <v-radio value="MANUAL"></v-radio>
                        </div>
                      </v-card-title>
                      <v-card-text class="pa-0">
                        <p class="mb-3 text-caption">Criar manualmente ainda será possível fazer uma avaliação 360, mas terá que conhecer previamente a relação entre avaliando e avaliado para escolher o tipo certo de aplicação.</p>
                      </v-card-text>
                    </v-card>
                  </div>
                </v-radio-group>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-row v-if="creationMode === '360'">
              <v-col cols="12" v-if="evaluationApplicationFormData?.applications?.length && evaluated360UserUuid">
                <v-card variant="outlined" class="pa-4 border">
                  <p class="font-weight-medium mb-2">Aplicações Geradas ({{ evaluationApplicationFormData.applications.length }}):</p>
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item v-for="(app, index) in evaluationApplicationFormData.applications" :key="index" class="py-1">
                      <template #prepend>
                        <v-icon color="success" size="small">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-caption">
                        {{ app.submitting_user?.name }} ({{ applicationTypeOptions.find(opt => opt.value === app.type)?.title }}) avaliando {{ app.evaluated_user?.name }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>

            <v-row v-else>
              <v-col cols="12" class="d-flex justify-space-between align-center">
                <h4 class="text-primary">Aplicações Manuais ({{ evaluationApplicationFormData?.applications?.length }})</h4>
                <v-btn color="primary" size="small" @click="addApplication" prepend-icon="mdi-plus-circle">
                  Adicionar Aplicação
                </v-btn>
              </v-col>

              <v-col cols="12" v-for="(app, index) in evaluationApplicationFormData?.applications" :key="index" class="py-2">
                <v-card variant="flat" class="pa-4 border">
                  <div class="d-flex justify-space-between align-center mb-4">
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
                          v-bind="field"
                          v-model="app.type"
                          :items="applicationTypeOptions"
                          label="Tipo"
                          variant="solo-filled"
                          :error="!!errorMessage"
                          :error-messages="errorMessage"
                        ></v-select>
                      </Field>
                    </v-col>

                    <v-col cols="12" sm="4">
                      <Field :name="`applications[${index}].evaluated_user_uuid`" label="Usuário Avaliado" rules="required" v-slot="{ field, errorMessage }">
                        <v-autocomplete
                          :model-value="app.evaluated_user_uuid"
                          @update:model-value="(uuidValue: any) => {
                            const finalValue = uuidValue?.value || uuidValue; 
                            app.evaluated_user_uuid = finalValue;
                            field.onChange(finalValue);
                          }"
                          label="Avaliado"
                          :items="accountUserStore.accountUsersOptions"
                          item-title="title"
                          item-value="value"
                          variant="solo-filled"
                          :error="!!errorMessage"
                          :error-messages="errorMessage"
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
                          :model-value="app.submitting_user_uuid"
                          @update:model-value="(uuidValue: any) => {
                            const finalValue = uuidValue?.value || uuidValue; 
                            app.submitting_user_uuid = finalValue;
                            field.onChange(finalValue);
                          }"
                          label="Avaliador"
                          :items="accountUserStore.accountUsersOptions"
                          item-title="title"
                          item-value="value"
                          :disabled="app.type === EvaluationType.SELF"
                          variant="solo-filled"
                          :error="!!errorMessage"
                          :error-messages="errorMessage"
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
          <v-btn color="primary" type="submit" :disabled="!evaluationApplicationFormData?.applications?.length">Salvar Aplicações ({{ evaluationApplicationFormData?.applications?.length }})</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
