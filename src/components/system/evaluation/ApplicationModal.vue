<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useUserStore } from '@/stores/auth.store';
import { useEvaluationApplicationStore, type EvaluationApplicationSavePayload } from '@/stores/evaluation.application.store';
import type EvaluationApplication from '@/types/evaluationApplication/evaluation-application.type';
import { useAccountUserStore } from '@/stores/account-user.store';

const evaluationApplicationStore = useEvaluationApplicationStore();
const evaluationStore = useEvaluationStore();
const userStore = useUserStore();
const accountUserStore = useAccountUserStore();

const props = defineProps<{
  modelValue: boolean;
  selectedApplication?: EvaluationApplication | null;
}>();

const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
  resetForm();
};

const evaluationApplicationFormData = reactive<EvaluationApplicationSavePayload>({
  evaluation_model_uuid: props.selectedApplication?.evaluation_model_uuid || '',
  type: props.selectedApplication?.type || 'self',
  requested_by_user_uuid: props.selectedApplication?.requested_by_user_uuid || userStore.user?.uuid || '',
  evaluated_collaborator_uuid: props.selectedApplication?.evaluated_collaborator_uuid || '',
  evaluator_collaborator_uuid: props.selectedApplication?.evaluator_collaborator_uuid || '',
  application_date: props.selectedApplication?.application_date || '',
  status: props.selectedApplication?.status || 'pending',
});

const isEditing = computed(() => !!props.selectedApplication);

const resetForm = () => {
  evaluationApplicationFormData.evaluation_model_uuid = props.selectedApplication?.evaluation_model_uuid || '';
  evaluationApplicationFormData.type = props.selectedApplication?.type || 'self';
  evaluationApplicationFormData.requested_by_user_uuid = props.selectedApplication?.requested_by_user_uuid || userStore.user?.uuid || '';
  evaluationApplicationFormData.evaluated_collaborator_uuid = props.selectedApplication?.evaluated_collaborator_uuid || '';
  evaluationApplicationFormData.evaluator_collaborator_uuid = props.selectedApplication?.evaluator_collaborator_uuid || '';
  evaluationApplicationFormData.application_date = props.selectedApplication?.application_date || '';
  evaluationApplicationFormData.status = props.selectedApplication?.status || 'pending';
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

watch(() => evaluationApplicationFormData.type, (newType) => {
  if (newType === 'self' && evaluationApplicationFormData.evaluated_collaborator_uuid) {
    evaluationApplicationFormData.evaluator_collaborator_uuid = evaluationApplicationFormData.evaluated_collaborator_uuid;
  }
});

watch(() => evaluationApplicationFormData.evaluated_collaborator_uuid, (newVal) => {
  if (evaluationApplicationFormData.type === 'self' && newVal) {
    evaluationApplicationFormData.evaluator_collaborator_uuid = newVal;
  }
});

const evaluationModelsOptions = computed(() => {
  return evaluationStore.evaluations?.map(model => ({
    title: `${model.title} (${model.rate} estrelas)`,
    value: model.uuid,
  })) || [];
});

const collaboratorsOptions = computed(() => {
  return accountUserStore.account_users?.map(user => ({
    title: user.name,
    value: user.uuid,
  })) || [];
});

const applicationTypeOptions = [
  { title: 'Autoavaliação', value: 'self' },
  { title: 'Avaliação por Pares', value: 'peer' },
  { title: 'Avaliação por Líder', value: 'leader' },
];

const rules = {
  required: (value: any) => !!value || 'Campo obrigatório.',
  isUuid: (value: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) || 'Selecione um item válido.',
};

async function onSubmit(formValues: EvaluationApplicationSavePayload) {
  try {
    if (isEditing.value && props.selectedApplication) {
      await evaluationApplicationStore.saveEvaluationApplication(formValues, props.selectedApplication.uuid);
    } else {
      await evaluationApplicationStore.saveEvaluationApplication(formValues);
    }
    close();
  } catch (err) {
    console.error('Erro ao salvar aplicação de avaliação:', err);
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="600px">
    <Form @submit="onSubmit" :initial-values="evaluationApplicationFormData">
      <v-card>
        <v-card-title class="text-h6">
          {{ isEditing ? 'Editar Aplicação de Avaliação' : 'Criar Nova Aplicação de Avaliação' }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <Field name="evaluation_model_uuid" label="Modelo de Avaliação" :rules="[rules.required, rules.isUuid]" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    v-model="evaluationApplicationFormData.evaluation_model_uuid"
                    :items="evaluationModelsOptions"
                    label="Selecione o Modelo de Avaliação"
                    variant="outlined"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  ></v-select>
                </Field>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-row>
              <v-col cols="12" sm="6">
                <Field name="type" label="Tipo de Avaliação" :rules="[rules.required]" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    v-model="evaluationApplicationFormData.type"
                    :items="applicationTypeOptions"
                    label="Tipo de Avaliação"
                    variant="outlined"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  ></v-select>
                </Field>
              </v-col>
              <v-col cols="12" sm="6">
                <Field name="application_date" label="Data de Aplicação" :rules="[rules.required]" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="evaluationApplicationFormData.application_date"
                    label="Data de Aplicação"
                    type="date"
                    variant="outlined"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  ></v-text-field>
                </Field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <Field name="evaluated_collaborator_uuid" label="Usuário Avaliado" :rules="[rules.required, rules.isUuid]" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    v-model="evaluationApplicationFormData.evaluated_collaborator_uuid"
                    :items="collaboratorsOptions"
                    label="Selecione o Avaliado"
                    variant="outlined"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  ></v-select>
                </Field>
              </v-col>
              <v-col cols="12" sm="6">
                <Field name="evaluator_collaborator_uuid" label="Usuário Avaliador" :rules="[rules.required, rules.isUuid]" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    v-model="evaluationApplicationFormData.evaluator_collaborator_uuid"
                    :items="collaboratorsOptions"
                    label="Selecione o Avaliador"
                    variant="outlined"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    :disabled="evaluationApplicationFormData.type === 'self'"
                  ></v-select>
                </Field>
              </v-col>
            </v-row>
          </v-container>
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
