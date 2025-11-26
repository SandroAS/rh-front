<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useEvaluationApplicationStore } from '@/stores/evaluation.application.store';
import { EvaluationApplicationStatus, EvaluationType, type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';
import { useAccountUserStore } from '@/stores/account-user.store';
import type EvaluationApplicationPayload from '@/types/evaluationApplication/evaluation-application-payload.type';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { getInitials } from '@/utils/getInitialsFromName.util';

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
  evaluation_model_uuid: props.selectedApplication?.evaluation_model_uuid || '',
  type: props.selectedApplication?.type || EvaluationType.SELF,
  evaluated_user_uuid: props.selectedApplication?.evaluated_user_uuid || '',
  submitting_user_uuid: props.selectedApplication?.submitting_user_uuid || '',
  started_date: props.selectedApplication?.started_date || undefined,
  expiration_date: props.selectedApplication?.expiration_date || undefined,
  status: props.selectedApplication?.status || EvaluationApplicationStatus.CREATED
});

const isEditing = computed(() => !!props.selectedApplication);

watch(() => evaluationApplicationFormData.type, (newType) => {
  if (newType === EvaluationType.SELF && evaluationApplicationFormData.evaluated_user_uuid) {
    evaluationApplicationFormData.submitting_user_uuid = evaluationApplicationFormData.evaluated_user_uuid;
  }
});

watch(() => evaluationApplicationFormData.evaluated_user_uuid, (newVal) => {
  if (evaluationApplicationFormData.type === EvaluationType.SELF && newVal) {
    evaluationApplicationFormData.submitting_user_uuid = newVal;
  }
});

const applicationTypeOptions = [
  { title: 'Autoavaliação', value: EvaluationType.SELF },
  { title: 'Avaliação por Pares', value: EvaluationType.PEER },
  { title: 'Avaliação por Líder', value: EvaluationType.LEADER },
  { title: 'Avaliação por Liderado', value: EvaluationType.SUBORDINATE },
];

async function onSubmit(formValues: Record<string, any>) {
  const payload = formValues as EvaluationApplicationPayload;
  try {
    if (isEditing.value && props.selectedApplication) {
      await evaluationApplicationStore.saveEvaluationApplication(payload, props.selectedApplication.uuid);
      snackbarStore.show('Modelo de Avaliação atualizado com sucesso!', 'success');
    } else {
      await evaluationApplicationStore.saveEvaluationApplication(payload);
      snackbarStore.show('Modelo de Avaliação adicionado com sucesso!', 'success');
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
          {{ !!evaluationApplicationFormData?.uuid ? 'Editar Aplicação de Avaliação' : 'Criar Nova Aplicação de Avaliação' }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <Field name="evaluation_model_uuid" label="Modelo de Avaliação" rules="required" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    v-model="evaluationApplicationFormData.evaluation_model_uuid"
                    :items="evaluationStore.evaluationOptions"
                    :item-props="true"
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
              <v-col cols="12" sm="12">
                <Field name="type" label="Tipo de Avaliação" rules="required" v-slot="{ field, errorMessage }">
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
                <Field name="started_date" label="Data de Aplicação" rules="required" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="evaluationApplicationFormData.started_date"
                    label="Data de Aplicação"
                    type="date"
                    variant="outlined"
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
                <Field name="evaluated_user_uuid" label="Usuário Avaliado" rules="required" v-slot="{ field, errorMessage }">
                  <v-autocomplete
                    v-model="evaluationApplicationFormData.evaluated_user_uuid"
                    @update:model-value="(uuidValue: any) => {
                      const finalValue = uuidValue?.value || uuidValue; 
                      evaluationApplicationFormData.evaluated_user_uuid = finalValue;
                      field.onChange(finalValue);
                    }"
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
                          v-if="item.raw.avatar" 
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
              </v-col>
              <v-col cols="12" sm="6">
                <Field name="submitting_user_uuid" label="Usuário Avaliador" rules="required" v-slot="{ field, errorMessage }">
                  <v-autocomplete
                    v-model="evaluationApplicationFormData.submitting_user_uuid"
                    @update:model-value="(uuidValue: any) => {
                      const finalValue = uuidValue?.value || uuidValue; 
                      evaluationApplicationFormData.submitting_user_uuid = finalValue;
                      field.onChange(finalValue);
                    }"
                    label="Selecione o Avaliador"
                    :items="accountUserStore.accountUsersOptions"
                    color="blue-grey-lighten-2"
                    item-title="title"
                    item-value="value"
                    :disabled="evaluationApplicationFormData.type === EvaluationType.SELF"
                    variant="solo-filled"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  >
                    <template v-slot:selection="{ item }">
                      <div v-if="item.value" class="d-flex align-center w-full">
                        <v-avatar 
                          v-if="item.raw.avatar" 
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
