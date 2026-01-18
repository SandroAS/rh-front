<script setup lang="ts">
import { Field } from '@/plugins/vee-validate';
import { EvaluationType, type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';
import { type CreateEvaluationApplication } from '@/types/evaluationApplication/evaluation-application-payload.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { getInitials } from '@/utils/getInitialsFromName.util';

const accountUserStore = useAccountUserStore();
const evaluationStore = useEvaluationStore();

const props = defineProps<{
  applications: CreateEvaluationApplication[];
  selectedApplication?: EvaluationApplication | null;
  evaluationUuid: string;
  creationType?: 'AUTOMATIC' | 'SELECTED_EVALUATION';
}>();

const emit = defineEmits<{
  'update:applications': [applications: CreateEvaluationApplication[]];
}>();

/**
 * Busca a avaliação apropriada baseada no jobPosition do usuário avaliado quando creationType é AUTOMATIC
 */
const findEvaluationForUser = (evaluatedUserUuid: string): string | undefined => {
  if (props.creationType === 'SELECTED_EVALUATION') {
    return props.evaluationUuid;
  }

  // AUTOMATIC: buscar avaliação que tem DRD vinculado ao jobPosition do usuário avaliado
  const evaluatedUser = accountUserStore.accountUsersOptionsTeams.find(
    user => user.value === evaluatedUserUuid
  );

  if (!evaluatedUser?.jobPosition?.uuid) {
    return undefined;
  }

  // Buscar avaliação que tem DRD com jobPosition igual ao do usuário avaliado
  const foundEvaluation = evaluationStore.evaluations_simple?.find(
    evaluation => evaluation.drd?.jobPosition?.uuid === evaluatedUser.jobPosition?.uuid
  );

  return foundEvaluation?.uuid;
};

const applicationTypeOptions = [
  { title: 'Autoavaliação', value: EvaluationType.SELF },
  { title: 'Avaliação por Pares', value: EvaluationType.PEER },
  { title: 'Avaliação por Líder', value: EvaluationType.LEADER },
  { title: 'Avaliação por Liderado', value: EvaluationType.SUBORDINATE },
];

const addApplication = () => {
  const newApplications = [...props.applications];
  // No modo SELECTED_EVALUATION, usar o evaluationUuid passado
  // No modo AUTOMATIC, evaluation_uuid será definido quando o usuário selecionar o avaliado
  const initialEvaluationUuid = props.creationType === 'SELECTED_EVALUATION' ? props.evaluationUuid : '';
  
  newApplications.push({
    type: EvaluationType.SELF,
    evaluation_uuid: initialEvaluationUuid,
    evaluated_user_uuid: '',
    evaluated_user: null,
    submitting_user_uuid: '',
    submitting_user: null,
  });
  emit('update:applications', newApplications);

  setTimeout(() => {
    props.applications.forEach((app, index) => {
      const inputType = document.querySelector(`#applications_${index}_type`) as HTMLInputElement;
      if(inputType && app.type) {
        inputType.value = app.type;
        inputType.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }, 50)
};

const removeApplication = (index: number) => {
  const newApplications = [...props.applications];
  newApplications.splice(index, 1);
  emit('update:applications', newApplications);
};

const updateApplication = (index: number, field: keyof CreateEvaluationApplication, value: any) => {
  const newApplications = [...props.applications];
  newApplications[index] = {
    ...newApplications[index],
    [field]: value
  };
  emit('update:applications', newApplications);
};

/**
 * Atualiza o usuário avaliado e define o evaluation_uuid automaticamente quando necessário
 */
const handleEvaluatedUserChange = (index: number, uuidValue: any, field: any) => {
  const finalValue = uuidValue?.value || uuidValue;
  const evaluatedUser = accountUserStore.accountUsersOptionsTeams.find(user => user.value === finalValue);

  const newApplications = [...props.applications];

  let evaluationUuid = newApplications[index].evaluation_uuid;
  if (props.creationType === 'AUTOMATIC' && finalValue) {
    const foundEvaluationUuid = findEvaluationForUser(finalValue);
    if (foundEvaluationUuid) {
      evaluationUuid = foundEvaluationUuid;
    }
  } else if (props.creationType === 'SELECTED_EVALUATION') {
    evaluationUuid = props.evaluationUuid;
  }

  newApplications[index] = {
    ...newApplications[index],
    evaluation_uuid: evaluationUuid,
    evaluated_user_uuid: finalValue,
    evaluated_user: evaluatedUser ? {
      uuid: evaluatedUser.value,
      profile_img_url: evaluatedUser.avatar,
      name: evaluatedUser.title,
      email: ''
    } : null
  };
  
  emit('update:applications', newApplications);
  field.onChange(finalValue);
};

/**
 * Atualiza o usuário avaliador (submitting_user)
 */
const handleSubmittingUserChange = (index: number, uuidValue: any, field: any) => {
  const finalValue = uuidValue?.value || uuidValue;
  const submittingUser = accountUserStore.accountUsersOptionsTeams.find(user => user.value === finalValue);

  const newApplications = [...props.applications];

  newApplications[index] = {
    ...newApplications[index],
    submitting_user_uuid: finalValue,
    submitting_user: submittingUser ? {
      uuid: submittingUser.value,
      profile_img_url: submittingUser.avatar,
      name: submittingUser.title,
      email: ''
    } : null
  };

  emit('update:applications', newApplications);
  field.onChange(finalValue);
};
</script>

<template>
  <v-row>
    <v-col v-if="!selectedApplication?.uuid" cols="12" class="d-flex justify-space-between align-center">
      <h4 class="text-primary">Aplicações Manuais ({{ applications?.length }})</h4>
      <v-btn color="primary" size="small" @click="addApplication" prepend-icon="mdi-plus-circle">
        Adicionar Aplicação
      </v-btn>
    </v-col>

    <v-col cols="12" v-for="(app, index) in applications" :key="index" class="py-2">
      <v-card variant="flat" class="pa-4 border">
        <div v-if="!selectedApplication?.uuid" class="d-flex justify-space-between align-center mb-4">
          <div class="text-subtitle-1">Aplicação #{{ index + 1 }}</div>
          <v-btn 
            v-if="applications?.length"
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
                :model-value="app.type"
                @update:model-value="(value) => {
                  updateApplication(index, 'type', value);
                  field.onChange(value);
                }"
                :items="applicationTypeOptions"
                label="Tipo"
                variant="solo-filled"
                :error="!!errorMessage"
                :error-messages="errorMessage"
                :hide-details="!!selectedApplication?.uuid"
                :disabled="!!selectedApplication?.uuid"
              ></v-select>
            </Field>
          </v-col>

          <v-col cols="12" sm="4">
            <Field :name="`applications[${index}].evaluated_user_uuid`" label="Usuário Avaliado" rules="required" v-slot="{ field, errorMessage }">
              <v-autocomplete
                :id="`applications_${index}_evaluated_user_uuid`"
                :model-value="app.evaluated_user_uuid"
                @update:model-value="(uuidValue: any) => handleEvaluatedUserChange(index, uuidValue, field)"
                label="Avaliado"
                :items="accountUserStore.accountUsersOptionsTeams"
                item-title="title"
                item-value="value"
                variant="solo-filled"
                :error="!!errorMessage"
                :error-messages="errorMessage"
                :hide-details="!!selectedApplication?.uuid"
                :disabled="!!selectedApplication?.uuid"
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
                :model-value="app.submitting_user_uuid"
                @update:model-value="(uuidValue: any) => handleSubmittingUserChange(index, uuidValue, field)"
                label="Avaliador"
                :items="accountUserStore.accountUsersOptionsTeams"
                item-title="title"
                item-value="value"
                :disabled="app.type === EvaluationType.SELF || !!selectedApplication?.uuid"
                variant="solo-filled"
                :error="!!errorMessage"
                :error-messages="errorMessage"
                :hide-details="!!selectedApplication?.uuid"
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
</template>
