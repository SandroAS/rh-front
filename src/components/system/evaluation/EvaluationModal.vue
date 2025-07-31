<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useDRDStore } from '@/stores/drd.store';
import { useUserStore } from '@/stores/user.store';
import type Evaluation from '@/types/evaluation/evaluation.type';
import type EvaluationPayload from '@/types/evaluation/evaluation-payload.type';
import { required } from '@vee-validate/rules';

const evaluationStore = useEvaluationStore();
const snackbarStore = useSnackbarStore();
const drdStore = useDRDStore();
const userStore = useUserStore();

const props = defineProps<{
  modelValue: boolean;
  selectedEvaluation?: Evaluation | null;
}>();

const emit = defineEmits(['update:modelValue']);

const close = () => emit('update:modelValue', false);

const evaluationFormData = reactive<EvaluationPayload>({
  uuid: props.selectedEvaluation?.uuid || undefined,
  title: props.selectedEvaluation?.title || '',
  description: props.selectedEvaluation?.description || '',
  created_by_user_uuid: props.selectedEvaluation?.created_by_user_uuid || userStore.user?.uuid || '',
  rate: props.selectedEvaluation?.rate || 5,
  drd_uuid: props.selectedEvaluation?.drd_uuid || undefined,
  evaluation_topics: props.selectedEvaluation?.evaluation_topics || [{
    uuid: undefined,
    title: '',
    description: '',
    evaluation_questions: [{ uuid: undefined, title: '', description: '', type: 'number', options: [] }]
  }],
});

const isEditing = computed(() => !!props.selectedEvaluation);
const isDrdSelected = computed(() => !!evaluationFormData.drd_uuid);

const drdOptions = computed(() => {
  if(!drdStore.drds) return [];
  return drdStore.drds.map(drd => ({
    title: `${drd.jobPosition?.name || 'DRD sem cargo'} - ${drd.rate} estrelas`,
    value: drd.uuid,
  }));
});

watch(() => props.selectedEvaluation, (val) => {
  evaluationFormData.uuid = val?.uuid || undefined;
  evaluationFormData.title = val?.title || '';
  evaluationFormData.description = val?.description || '';
  evaluationFormData.created_by_user_uuid = val?.created_by_user_uuid || userStore.user?.uuid || '';
  evaluationFormData.rate = val?.rate || 5;
  evaluationFormData.drd_uuid = val?.drd_uuid || undefined;
  evaluationFormData.evaluation_topics = val?.evaluation_topics || [{
    uuid: undefined,
    title: '',
    description: '',
    evaluation_questions: [{ uuid: undefined, title: '', description: '', type: 'number', options: [] }]
  }];
}, { immediate: true });

watch(() => evaluationFormData.drd_uuid, (newDrdUuid) => {
  if (newDrdUuid && drdStore.drds) {
    const selectedDrd = drdStore.drds.find(drd => drd.uuid === newDrdUuid);
    if (selectedDrd) {
      evaluationFormData.evaluation_topics = selectedDrd.drdTopics.map(drdTopic => ({
        uuid: undefined,
        title: drdTopic.name,
        description: '',
        evaluation_questions: drdTopic.drdTopicItems.map(drdItem => ({
          uuid: undefined,
          title: drdItem.name,
          description: '',
          type: 'number',
          options: []
        }))
      }));
    }
  } else {
    if (!isEditing.value) {
      evaluationFormData.evaluation_topics = [{
        uuid: undefined,
        title: '',
        description: '',
        evaluation_questions: [{ uuid: undefined, title: '', description: '', type: 'number', options: [] }]
      }];
    }
  }
});

watch(() => props.modelValue, async (newVal) => {
  if (newVal && drdStore.drds && drdStore.drds.length === 0) {
    await drdStore.getDRDs({ page: 1, limit: 1000 });
  }
}, { immediate: true });

const addEvaluationTopic = () => {
  evaluationFormData.evaluation_topics.push({
    uuid: undefined,
    title: '',
    description: '',
    evaluation_questions: [{ uuid: undefined, title: '', description: '', type: 'number', options: [] }]
  });
};

const removeEvaluationTopic = (index: number) => {
  if (evaluationFormData.evaluation_topics.length > 1) {
    evaluationFormData.evaluation_topics.splice(index, 1);
  } else {
    snackbarStore.show('Não é possível remover todos os tópicos da avaliação. Adicione um novo para poder remover este.', 'warning');
  }
};

const addQuestion = (topicIndex: number) => {
  evaluationFormData.evaluation_topics[topicIndex].evaluation_questions.push({
    uuid: undefined,
    title: '',
    description: '',
    type: 'number',
    options: []
  });
};

const removeQuestion = (topicIndex: number, questionIndex: number) => {
  if (
    evaluationFormData.evaluation_topics[topicIndex].evaluation_questions.length > 1
  ) {
    evaluationFormData.evaluation_topics[topicIndex].evaluation_questions.splice(questionIndex, 1);
  } else {
    snackbarStore.show('Não é possível remover todas as perguntas do tópico. Adicione uma nova para poder remover esta.', 'warning');
  }
};

const addQuestionOption = (topicIndex: number, questionIndex: number) => {
  const question = evaluationFormData.evaluation_topics[topicIndex].evaluation_questions[questionIndex];
  if (!question.options) {
    question.options = [];
  }
  question.options.push('');
};

const removeQuestionOption = (topicIndex: number, questionIndex: number, optionIndex: number) => {
  const question = evaluationFormData.evaluation_topics[topicIndex].evaluation_questions[questionIndex];
  if (question.options && question.options.length > 1) {
    question.options.splice(optionIndex, 1);
  } else {
    snackbarStore.show('Não é possível remover todas as opções da pergunta. Adicione uma nova para poder remover esta.', 'warning');
  }
};

const rules = {
  required: (value: any) => !!value || 'Campo obrigatório.',
  rateRange: (v: number) => (v >= 3 && v <= 10) || 'O rate deve ser entre 3 e 10.',
  minTitle: (v: string) => v.length >= 3 || 'Mínimo 3 caracteres.',
  positiveNumber: (v: number) => v >= 0 || 'Deve ser um número positivo.',
};

async function onSubmit(formValues: Record<string, any>) {
  const payload: EvaluationPayload = {
    ...formValues,
    title: formValues.title || '',
    description: formValues.description || '',
    rate: formValues.rate || 5,
    evaluation_topics: formValues.evaluation_topics || [],
    created_by_user_uuid: userStore.user?.uuid || evaluationFormData.created_by_user_uuid
  };

  // Limpa opções se o tipo da questão não for 'select' ou 'options'
  payload.evaluation_topics.forEach(topic => {
    topic.evaluation_questions.forEach(question => {
      if (question.type !== 'select' && question.type !== 'options') {
        question.options = [];
      }
    });
  });

  try {
    if (isEditing.value && props.selectedEvaluation) {
      await evaluationStore.saveEvaluation(payload, props.selectedEvaluation.uuid);
      snackbarStore.show('Avaliação atualizada com sucesso!', 'success');
    } else {
      await evaluationStore.saveEvaluation(payload);
      snackbarStore.show('Avaliação adicionada com sucesso!', 'success');
    }
    close();
  } catch (err: any) {
    console.error('Erro no registro da avaliação:', err);
    snackbarStore.show(evaluationStore.error || 'Falha ao salvar avaliação.', 'error');
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="800px">
    <Form @submit="onSubmit" :initial-values="evaluationFormData">
      <v-card>
        <v-card-title class="text-h6">
          {{ isEditing ? 'Editar Modelo de Avaliação' : 'Novo Modelo de Avaliação' }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <Field name="title" label="Título do Modelo de Avaliação" rules="required|min:3" v-slot="{ field, errorMessage }">
                  <v-text-field
                    v-bind="field"
                    v-model="evaluationFormData.title"
                    label="Título do Modelo de Avaliação"
                    variant="solo-filled"
                    density="compact"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  ></v-text-field>
                </Field>
              </v-col>
              <v-col cols="12">
                <Field name="description" label="Descrição" rules="required" v-slot="{ field, errorMessage }">
                  <v-textarea
                    v-bind="field"
                    v-model="evaluationFormData.description"
                    label="Descrição"
                    variant="solo-filled"
                    density="compact"
                    rows="3"
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                  ></v-textarea>
                </Field>
              </v-col>
              <v-col cols="12" sm="12">
                <Field name="rate" label="Rate da Avaliação"rules="required" v-slot="{ field, errorMessage }">
                  <div class="d-flex align-center">
                    <v-rating
                      v-bind="field"
                      v-model="evaluationFormData.rate"
                      color="primary"
                      density="compact"
                      half-increments
                      hover
                      :length="10"
                      size="x-large"
                    ></v-rating>
                    <span class="ml-2 text-h6">{{ evaluationFormData.rate }}</span>
                  </div>
                  <v-messages v-if="errorMessage" :value="[errorMessage]" color="error"></v-messages>
                </Field>
              </v-col>

              <v-col cols="12" sm="12">
                <Field name="drd_uuid" label="Vincular a um DRD (Opcional)" v-slot="{ field, errorMessage }">
                  <v-select
                    v-bind="field"
                    v-model="evaluationFormData.drd_uuid"
                    :items="drdOptions"
                    item-title="title"
                    item-value="value"
                    label="Vincular a um DRD (Opcional)"
                    variant="solo-filled"
                    density="compact"
                    clearable
                    :error="!!errorMessage"
                    :error-messages="errorMessage"
                    hint="Ao selecionar um DRD, os tópicos e questões serão preenchidos automaticamente."
                    persistent-hint
                  ></v-select>
                </Field>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <h3 class="text-subtitle-1 mb-3">Tópicos e Questões da Avaliação</h3>
            <v-alert
              v-if="isDrdSelected"
              type="info"
              variant="tonal"
              class="mb-4"
              icon="mdi-information"
              text="Os tópicos e questões foram preenchidos com base no DRD selecionado e não podem ser editados manualmente."
            ></v-alert>

            <div v-if="evaluationFormData.evaluation_topics">
                <div v-for="(topic, topicIndex) in evaluationFormData.evaluation_topics" :key="topicIndex" class="mb-4 pa-3 border rounded">
                  <div class="d-flex align-center mb-2">
                    <div class="flex-grow-1">
                      <Field :name="`evaluation_topics[${topicIndex}].title`" :label="`Título do Tópico ${topicIndex + 1}`" :rules="rules.required" v-slot="{ field, errorMessage }">
                        <v-text-field
                          v-bind="field"
                          v-model="topic.title"
                          :label="`Título do Tópico ${topicIndex + 1}`"
                          variant="solo-filled"
                          density="compact"
                          :error="!!errorMessage"
                          :error-messages="errorMessage"
                          class="mb-1 w-100"
                          :disabled="isDrdSelected"
                        />
                      </Field>
                      <Field :name="`evaluation_topics[${topicIndex}].description`" :label="`Descrição do Tópico ${topicIndex + 1}`" v-slot="{ field, errorMessage }">
                        <v-textarea
                          v-bind="field"
                          v-model="topic.description"
                          :label="`Descrição do Tópico ${topicIndex + 1} (Opcional)`"
                          variant="solo-filled"
                          density="compact"
                          rows="2"
                          :error="!!errorMessage"
                          :error-messages="errorMessage"
                          class="mb-1 w-100"
                          :disabled="isDrdSelected"
                        />
                      </Field>
                    </div>
                    <v-btn
                      v-if="evaluationFormData.evaluation_topics.length > 1 && !isDrdSelected"
                      icon
                      variant="text"
                      color="error"
                      @click="removeEvaluationTopic(topicIndex)"
                      size="small"
                      class="ml-2"
                      :disabled="isDrdSelected"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>

                  <h4 class="text-subtitle-2 ml-4 mb-2">Questões do Tópico</h4>
                  <div v-if="topic.evaluation_questions">
                    <div v-for="(question, questionIndex) in topic.evaluation_questions" :key="questionIndex" class="d-flex align-center ml-8 mb-2">
                      <div class="flex-grow-1">
                        <Field :name="`evaluation_topics[${topicIndex}].evaluation_questions[${questionIndex}].title`" :label="`Título da Questão ${questionIndex + 1}`" :rules="rules.required" v-slot="{ field, errorMessage }">
                          <v-text-field
                            v-bind="field"
                            v-model="question.title"
                            :label="`Título da Questão ${questionIndex + 1}`"
                            variant="solo-filled"
                            density="compact"
                            :error="!!errorMessage"
                            :error-messages="errorMessage"
                            class="mb-1 w-100"
                            :disabled="isDrdSelected"
                          />
                        </Field>
                        <Field :name="`evaluation_topics[${topicIndex}].evaluation_questions[${questionIndex}].description`" :label="`Descrição da Questão ${questionIndex + 1}`" v-slot="{ field, errorMessage }">
                          <v-textarea
                            v-bind="field"
                            v-model="question.description"
                            :label="`Descrição da Questão ${questionIndex + 1} (Opcional)`"
                            variant="solo-filled"
                            density="compact"
                            rows="2"
                            :error="!!errorMessage"
                            :error-messages="errorMessage"
                            class="mb-1 w-100"
                            :disabled="isDrdSelected"
                          />
                        </Field>
                        <Field :name="`evaluation_topics[${topicIndex}].evaluation_questions[${questionIndex}].type`" :label="`Tipo da Questão ${questionIndex + 1}`" :rules="rules.required" v-slot="{ field, errorMessage }">
                          <v-select
                            v-bind="field"
                            v-model="question.type"
                            :items="['text', 'select', 'number', 'options']"
                            label="Tipo da Questão"
                            variant="solo-filled"
                            density="compact"
                            :error="!!errorMessage"
                            :error-messages="errorMessage"
                            class="mb-1 w-100"
                            :disabled="isDrdSelected"
                          >
                            <template v-slot:append-inner>
                              <v-tooltip text="Recomendamos o tipo 'number' para métricas objetivas.">
                                <v-icon icon="mdi-information-outline"></v-icon>
                              </v-tooltip>
                            </template>
                          </v-select>
                        </Field>

                        <div v-if="['select', 'options'].includes(question.type!)">
                          <h5 class="text-subtitle-2 ml-4 mb-2">Opções da Questão</h5>
                          <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="d-flex align-center ml-8 mb-2">
                            <Field :name="`evaluation_topics[${topicIndex}].evaluation_questions[${questionIndex}].options[${optionIndex}]`" :label="`Opção ${optionIndex + 1}`" :rules="rules.required" v-slot="{ field, errorMessage }">
                              <v-text-field
                                v-bind="field"
                                v-model="question.options![optionIndex]"
                                :label="`Opção ${optionIndex + 1}`"
                                variant="solo-filled"
                                density="compact"
                                :error="!!errorMessage"
                                :error-messages="errorMessage"
                                class="mb-1 w-100"
                                :disabled="isDrdSelected"
                              />
                            </Field>
                            <v-btn
                              v-if="question.options!.length > 1 && !isDrdSelected"
                              icon
                              variant="text"
                              color="error"
                              @click="removeQuestionOption(topicIndex, questionIndex, optionIndex)"
                              size="small"
                              class="ml-2"
                              :disabled="isDrdSelected"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </div>
                          <v-btn
                            color="blue-grey-lighten-2"
                            variant="outlined"
                            @click="addQuestionOption(topicIndex, questionIndex)"
                            class="mt-2 ml-4"
                            size="small"
                            :disabled="isDrdSelected"
                          >
                            <v-icon left>mdi-plus</v-icon> Adicionar Opção
                          </v-btn>
                        </div>
                      </div>
                      <v-btn
                        v-if="topic.evaluation_questions.length > 1 && !isDrdSelected"
                        icon
                        variant="text"
                        color="error"
                        @click="removeQuestion(topicIndex, questionIndex)"
                        size="small"
                        class="ml-2"
                        :disabled="isDrdSelected"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    @click="addQuestion(topicIndex)"
                    class="mt-2 ml-4"
                    size="small"
                    :disabled="isDrdSelected"
                  >
                    <v-icon left>mdi-plus</v-icon> Adicionar Questão
                  </v-btn>
                </div>
            </div>

            <v-btn
              color="primary"
              variant="outlined"
              @click="addEvaluationTopic"
              block
              class="mt-4"
              :disabled="isDrdSelected"
            >
              <v-icon left>mdi-plus</v-icon> Adicionar Tópico
            </v-btn>

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

<style scoped>
.border {
  border: 1px solid rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.rounded {
  border-radius: 4px;
}
.gap-2 {
  gap: 8px;
}
</style>
