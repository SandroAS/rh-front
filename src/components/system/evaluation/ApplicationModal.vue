<script setup lang="ts">
import { watch, ref, reactive, computed } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
import { EvaluationApplicationStatus, EvaluationType, type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { type CreateEvaluationApplication, type EvaluationApplicationPayload } from '@/types/evaluationApplication/evaluation-application-payload.type';
import EvaluationCreationTypeSelector from './applicationModal/EvaluationCreationTypeSelector.vue';
import EvaluationCreationModeSelector from './applicationModal/EvaluationCreationModeSelector.vue';
import RecurrencePeriodsDisplay from './applicationModal/RecurrencePeriodsDisplay.vue';
import GeneratedApplications from './applicationModal/GeneratedApplications.vue';
import ManualApplications from './applicationModal/ManualApplications.vue';

const evaluationApplicationStore = useEvaluationApplicationStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean;
  selectedApplication?: EvaluationApplication | null;
}>();
const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
};

const evaluationApplicationFormData = reactive<EvaluationApplicationPayload & { duration_days?: number; recurrence?: string }>({
  uuid: props.selectedApplication?.uuid || undefined,
  evaluation_uuid: props.selectedApplication?.evaluation_uuid || '',
  evaluation: props.selectedApplication?.evaluation || undefined,
  started_date: props.selectedApplication?.started_date || new Date(),
  expiration_date: props.selectedApplication?.expiration_date || new Date(),
  duration_days: undefined,
  recurrence: undefined,
  status: props.selectedApplication?.status || EvaluationApplicationStatus.CREATED,
  applications: props.selectedApplication && props.selectedApplication.type
  ? [{
    type: props.selectedApplication.type,
    evaluation_uuid: props.selectedApplication.evaluation_uuid || '',
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

const creationType = ref<'AUTOMATIC' | 'SELECTED_EVALUATION'>('AUTOMATIC');
const creationMode = ref<'MANUAL' | '360'>('360');
const evaluated360UserUuid = ref<string[]>(props.selectedApplication ? [props.selectedApplication.evaluated_user_uuid || ''] : []);


const recurrenceOptions = [
  { title: 'Mensal', value: 'month' },
  { title: 'Bimestral', value: 'bimonth' },
  { title: 'Trimestral', value: 'quarter' },
  { title: 'Semestral', value: 'semester' },
  { title: 'Anual', value: 'year' },
];

/**
 * Label dinâmica para o campo de data inicial baseado na seleção de recorrência
 */
const startedDateLabel = computed(() => {
  return evaluationApplicationFormData.recurrence 
    ? 'Data de início da recorrência' 
    : 'Data de envio da aplicação';
});

/**
 * Calcula a data de expiração baseada na data de início e duração em dias
 */
const calculatedExpirationDate = computed(() => {
  if (!evaluationApplicationFormData.started_date || !evaluationApplicationFormData.duration_days) {
    return null;
  }
  
  const startDate = new Date(evaluationApplicationFormData.started_date);
  const expirationDate = new Date(startDate);
  expirationDate.setDate(expirationDate.getDate() + (evaluationApplicationFormData.duration_days || 0));
  
  return expirationDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
});

/**
 * Verifica se todas as aplicações têm evaluation_uuid preenchido
 */
const isAllApplicationsValid = computed(() => {
  const applications = evaluationApplicationFormData.applications || [];
  
  if (applications.length === 0) {
    return false;
  }
  
  // Verifica se todas as aplicações têm evaluation_uuid preenchido
  return applications.every(app => app.evaluation_uuid && app.evaluation_uuid.trim() !== '');
});

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
    
    // Calcular duration_days se houver started_date e expiration_date
    if (selectedApplication?.started_date && selectedApplication?.expiration_date) {
      const start = new Date(selectedApplication.started_date);
      const expiration = new Date(selectedApplication.expiration_date);
      const diffTime = expiration.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      evaluationApplicationFormData.duration_days = diffDays > 0 ? diffDays : undefined;
    }
    
    evaluationApplicationFormData.recurrence = undefined;

    evaluationApplicationFormData.status = selectedApplication?.status || EvaluationApplicationStatus.CREATED;

    if (selectedApplication) {
      setTimeout(() => {
        evaluationApplicationFormData.applications = [{
          type: selectedApplication?.type || EvaluationType.SELF,
          evaluation_uuid: selectedApplication?.evaluation_uuid || '',
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

async function onSubmit(formValues: Record<string, any>) {
  const applicationsToSave = evaluationApplicationFormData.applications || [];

  // Calcular expiration_date se houver duration_days e started_date
  let expirationDate = evaluationApplicationFormData.expiration_date;
  if (evaluationApplicationFormData.started_date && evaluationApplicationFormData.duration_days && !evaluationApplicationFormData.recurrence) {
    const startDate = new Date(evaluationApplicationFormData.started_date);
    const calculatedExpiration = new Date(startDate);
    calculatedExpiration.setDate(calculatedExpiration.getDate() + evaluationApplicationFormData.duration_days);
    expirationDate = calculatedExpiration.toISOString().split('T')[0];
  }

  const payload = {
    uuid: evaluationApplicationFormData.uuid,
    evaluation_uuid: evaluationApplicationFormData.evaluation_uuid,
    started_date: evaluationApplicationFormData.started_date,
    expiration_date: expirationDate,
    status: evaluationApplicationFormData.status,
    applications: applicationsToSave.map(app => ({
      uuid: app.uuid,
      evaluation_uuid: app.evaluation_uuid || evaluationApplicationFormData.evaluation_uuid,
      started_date: evaluationApplicationFormData.started_date,
      expiration_date: expirationDate,
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
              <v-col v-if="!props.selectedApplication?.uuid" cols="12" sm="12">
                <EvaluationCreationTypeSelector
                  v-model="creationType"
                  :evaluation-uuid="evaluationApplicationFormData.evaluation_uuid"
                  @update:evaluation-uuid="evaluationApplicationFormData.evaluation_uuid = $event"
                />
              </v-col>

              <v-col cols="12" sm="12">
                <Field name="recurrence" label="Recorrência" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    v-model="evaluationApplicationFormData.recurrence"
                    :items="recurrenceOptions"
                    label="Recorrência (opcional)"
                    variant="solo-filled"
                    density="compact"
                    clearable
                    hide-details
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  ></v-select>
                </Field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <Field name="started_date" :label="startedDateLabel" rules="required" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="evaluationApplicationFormData.started_date"
                    :label="startedDateLabel"
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
                <div>
                  <Field name="duration_days" label="Duração" :rules="{required: !evaluationApplicationFormData.recurrence}" v-slot="{ field, errorMessage }">
                    <v-text-field
                      v-bind="field"
                      v-model.number="evaluationApplicationFormData.duration_days"
                      label="Tempo em dias que ficará disponível para responder"
                      type="number"
                      min="1"
                      variant="solo-filled"
                      density="compact"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                    ></v-text-field>
                  </Field>
                </div>
                <div v-if="!evaluationApplicationFormData.recurrence && calculatedExpirationDate" cols="12" sm="4" class="d-flex align-center">
                  <span class="text-caption text-medium-emphasis">
                    Ficará disponível para responder até: {{ calculatedExpirationDate }}
                  </span>
                </div>
              </v-col>
              
              <v-col v-if="evaluationApplicationFormData.recurrence" cols="12" sm="12">
                <RecurrencePeriodsDisplay 
                  :started-date="evaluationApplicationFormData.started_date"
                  :recurrence="evaluationApplicationFormData.recurrence"
                />
              </v-col>

              <v-divider v-if="!props.selectedApplication?.uuid"/>

              <v-col v-if="!props.selectedApplication?.uuid" cols="12" sm="12">
                <EvaluationCreationModeSelector
                  v-model="creationMode"
                  :evaluated360-user-uuid="evaluated360UserUuid"
                  @update:evaluated360-user-uuid="evaluated360UserUuid = $event"
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-row v-if="creationMode === '360' && !props.selectedApplication?.uuid">
              <v-col cols="12" v-if="evaluated360UserUuid.length > 0">
                <GeneratedApplications 
                  :evaluated-uuids="evaluated360UserUuid"
                  :creation-type="creationType"
                  :evaluation-uuid="evaluationApplicationFormData.evaluation_uuid"
                  @update:applications="evaluationApplicationFormData.applications = $event"
                  @update:applications-grouped="applicationsGrupedByEvaluated = $event"
                />
              </v-col>
              <v-col cols="12" v-else-if="evaluated360UserUuid.length === 0 && !props.selectedApplication?.uuid">
                <v-alert type="info" variant="tonal" density="compact">Selecione um ou mais usuários para gerar automaticamente as aplicações 360.</v-alert>
              </v-col>
            </v-row>

            <ManualApplications
              v-else
              :applications="evaluationApplicationFormData.applications || []"
              :selected-application="props.selectedApplication"
              :evaluation-uuid="evaluationApplicationFormData.evaluation_uuid"
              :creation-type="creationType"
              @update:applications="evaluationApplicationFormData.applications = $event"
            />

          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit" :disabled="!isAllApplicationsValid">
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
