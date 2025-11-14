<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useDRDStore } from '@/stores/drd.store';
import { useUserStore } from '@/stores/auth.store';
import type Evaluation from '@/types/evaluation/evaluation.type';
import type EvaluationPayload from '@/types/evaluation/evaluation-payload.type';
import { QuestionType, type EvaluationQuestion } from '@/types/evaluation/evaluation-question.type';

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
  evaluation_topics: props.selectedEvaluation?.evaluation_topics?.map(topic => ({
    uuid: topic.uuid,
    drd_topic_uuid: topic.drd_topic_uuid,
    title: topic.title,
    description: topic.description,
    order: topic.order,
    evaluation_questions: topic.evaluation_questions.map(question => ({
      uuid: question.uuid,
      title: question.title,
      description: question.description,
      type: question.type,
      order: question.order,
      options: question.options?.map(option => ({
        uuid: option.uuid,
        text: option.text,
        order: option.order,
      })) || [{
        uuid: undefined,
        text: '',
        order: 1,
      }]
    }))
  })) || [{
    uuid: undefined,
    title: '',
    description: '',
    order: 1,
    evaluation_questions: [{
      uuid: undefined,
      title: '',
      description: '',
      type: QuestionType.RATE,
      order: 1,
      options: [{
        uuid: undefined,
        text: '',
        order: 1,
      }]
    }] 
  }],
});

const frontendQuestionTypes = [
  { value: QuestionType.RATE, text: 'Classificação', icon: 'mdi-star-outline' },
  { value: QuestionType.SHORT_TEXT, text: 'Resposta curta', icon: 'mdi-text-short' },
  { value: QuestionType.LONG_TEXT, text: 'Parágrafo', icon: 'mdi-text' },
  { value: QuestionType.SINGLE_CHOICE, text: 'Múltipla escolha', icon: 'mdi-radiobox-marked' },
  { value: QuestionType.MULTI_CHOICE, text: 'Caixas de seleção', icon: 'mdi-checkbox-marked-outline' },
  { value: QuestionType.DROPDOWN, text: 'Lista suspensa', icon: 'mdi-arrow-down-drop-circle-outline' },
]

const evaluationMode = ref('fromDRD');

const isEditing = computed(() => !!props.selectedEvaluation);
const isDrdSelected = computed(() => !!evaluationFormData.drd_uuid);

function forceUpdateVeeValidate() {
  evaluationFormData.evaluation_topics.forEach((topic, topicIndex) => {
    const inputTopicTitle = document.querySelector(`#evaluation_topics_${topicIndex}_title`) as HTMLInputElement;
    if(inputTopicTitle) {
      inputTopicTitle.value = topic.title;
      inputTopicTitle.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const inputTopicDescription = document.querySelector(`#evaluation_topics_${topicIndex}_description`) as HTMLInputElement;
    if(inputTopicDescription) {
      inputTopicDescription.value = topic.description;
      inputTopicDescription.dispatchEvent(new Event('change', { bubbles: true }));
    }
    topic.evaluation_questions.forEach((question, questionIndex) => {
      const inputQuestionTitle = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_title`) as HTMLInputElement;
      if(inputQuestionTitle) {
        inputQuestionTitle.value = question.title;
        inputQuestionTitle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputQuestionDescription = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_description`) as HTMLInputElement;
      if(inputQuestionDescription) {
        inputQuestionDescription.value = question.description;
        inputQuestionDescription.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputQuestionType = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_type`) as HTMLInputElement;
      if(inputQuestionType) {
        inputQuestionType.value = question.type;
        inputQuestionType.dispatchEvent(new Event('change', { bubbles: true }));
      }
      question.options?.forEach((option, optionIndex) => {
        const inputQuestionOption = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_options_${optionIndex}_text`) as HTMLInputElement;
        if(inputQuestionOption && option.text !== '') {
          inputQuestionOption.value = option.text;
          inputQuestionOption.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })
    })
  })
}

watch(() => props.selectedEvaluation, (val) => {
  evaluationFormData.uuid = val?.uuid || undefined;
  evaluationFormData.title = val?.title || '';
  evaluationFormData.description = val?.description || '';
  evaluationFormData.created_by_user_uuid = val?.created_by_user_uuid || userStore.user?.uuid || '';
  evaluationFormData.rate = typeof val?.rate === 'number' ? val.rate : 5;
  evaluationFormData.drd_uuid = val?.drd_uuid ?? undefined;
  evaluationFormData.evaluation_topics = val?.evaluation_topics?.map((topic, topicIndex) => ({
    uuid: topic?.uuid ?? undefined,
    title: topic?.title ?? '',
    description: topic?.description ?? '',
    order: typeof topicIndex === 'number' ? topicIndex + 1 : 1,
    evaluation_questions: topic.evaluation_questions?.map((question) => ({
      uuid: question.uuid,
      title: question.title,
      description: question.description,
      type: question.type,
      order: question.order,
      options: question.options || []
    }))
  })) || [{
    uuid: undefined,
    title: '',
    description: '',
    order: 1,
    evaluation_questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, order: 1, options: [] }]
  }];
}, { immediate: true });

watch(() => evaluationFormData.drd_uuid, async (newDrdUuid) => {
  const defaultTopics = [{
    uuid: undefined,
    title: '',
    description: '',
    order: 1,
    evaluation_questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, order: 1, options: [] }]
  }];

  if (newDrdUuid) {
    try {
      const fullDrd = await drdStore.getDRD(newDrdUuid);

      if (fullDrd) {
        evaluationFormData.rate = fullDrd.rate;
        evaluationFormData.evaluation_topics = fullDrd.drdTopics?.map((drdTopic, drdTopicIndex) => ({
          uuid: undefined,
          drd_topic_uuid: drdTopic.uuid,
          title: drdTopic.name,
          description: '',
          order: drdTopicIndex + 1,
          evaluation_questions: drdTopic.drdTopicItems?.map((drdItem, drdItemIndex) => ({
            uuid: undefined,
            drd_item_uuid: drdItem.uuid,
            title: drdItem.name,
            description: '',
            type: QuestionType.RATE,
            order: drdItemIndex + 1,
            options: []
          }))
        }));
        setTimeout(() => {
          forceUpdateVeeValidate()
        }, 50)
      }
    } catch (error) {
      console.error('Erro ao buscar DRD:', error);
      if (!isEditing.value) {
        evaluationFormData.evaluation_topics = defaultTopics;
        evaluationFormData.rate = 5;
      }
    }
  } else if (!isEditing.value) {
    evaluationFormData.evaluation_topics = defaultTopics;
    evaluationFormData.rate = 5;

    setTimeout(() => {
      forceUpdateVeeValidate()
    }, 50)
  }
});

watch(() => evaluationMode.value, (newVal) => {
  const defaultTopics = [{
    uuid: undefined,
    title: '',
    description: '',
    order: 1,
    evaluation_questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, order: 1, options: [] }]
  }];

  if(newVal === 'fromZero') {
    evaluationFormData.evaluation_topics = defaultTopics;
    evaluationFormData.rate = 5;

    setTimeout(() => {
      forceUpdateVeeValidate()
    }, 50)
  }
})

watch(() => props.modelValue, async (newVal) => {
  if (newVal && drdStore.drds?.length === 0) {
    await drdStore.getDRDs({ page: 1, limit: 1000 });
  }
}, { immediate: true });

const addEvaluationTopic = () => {
  evaluationFormData.evaluation_topics.push({
    uuid: undefined,
    title: '',
    description: '',
    order: evaluationFormData.evaluation_topics.length + 1,
    evaluation_questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, order: 1, options: [] }]
  });
};

const removeEvaluationTopic = (index: number) => {
  if (evaluationFormData.evaluation_topics.length > 1) {
    evaluationFormData.evaluation_topics.splice(index, 1);

    evaluationFormData.evaluation_topics.forEach((topic, topicIndex) => {
      topic.order = topicIndex + 1;
    })

    forceUpdateVeeValidate()
  } else {
    snackbarStore.show('Não é possível remover todos os tópicos. Adicione um novo para poder remover este.', 'warning');
  }
};

const addQuestion = (topicIndex: number) => {
  evaluationFormData.evaluation_topics[topicIndex].evaluation_questions.push({
    uuid: undefined,
    title: '',
    description: '',
    type: QuestionType.RATE,
    order: 1,
    options: []
  });
};

const removeQuestion = (topicIndex: number, questionIndex: number) => {
  if (evaluationFormData.evaluation_topics[topicIndex].evaluation_questions.length > 1) {
    evaluationFormData.evaluation_topics[topicIndex].evaluation_questions.splice(questionIndex, 1);

    evaluationFormData.evaluation_topics[topicIndex].evaluation_questions.forEach((question, questionIndex) => {
      question.order = questionIndex + 1;
    });

    evaluationFormData.evaluation_topics[topicIndex].evaluation_questions.forEach((question, questionIndex) => {
      const inputQuestionTitle = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_title`) as HTMLInputElement;
      if(inputQuestionTitle) {
        inputQuestionTitle.value = question.title;
        inputQuestionTitle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputQuestionDescription = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_description`) as HTMLInputElement;
      if(inputQuestionDescription) {
        inputQuestionDescription.value = question.description;
        inputQuestionDescription.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputQuestionType = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_type`) as HTMLInputElement;
      if(inputQuestionType) {
        inputQuestionType.value = question.type;
        inputQuestionType.dispatchEvent(new Event('change', { bubbles: true }));
      }
      question.options?.forEach((option, optionIndex) => {
        const inputQuestionOption = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_options_${optionIndex}_text`) as HTMLInputElement;
        if(inputQuestionOption && option.text !== '') {
          inputQuestionOption.value = option.text;
          inputQuestionOption.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })
    })
  } else {
    snackbarStore.show('Não é possível remover todas as perguntas do tópico. Adicione uma nova para poder remover esta.', 'warning');
  }
};

const addQuestionOption = (topicIndex: number, questionIndex: number) => {
  const question = evaluationFormData.evaluation_topics[topicIndex].evaluation_questions[questionIndex];
  question.options?.push({ uuid: undefined, text: '', order: question.options.length + 1 });
};

const removeQuestionOption = (topicIndex: number, questionIndex: number, optionIndex: number) => {
  const question = evaluationFormData.evaluation_topics[topicIndex].evaluation_questions[questionIndex];
  if (question.options && question.options.length > 1) {
    question.options.splice(optionIndex, 1);

    question.options.forEach((option, idx) => {
      option.order = idx + 1;
    });

    question.options?.forEach((option, optionIndex) => {
      const inputQuestionOption = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_options_${optionIndex}_text`) as HTMLInputElement;
      if(inputQuestionOption && option.text !== '') {
        inputQuestionOption.value = option.text;
        inputQuestionOption.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })
  } else {
    snackbarStore.show('Não é possível remover todas as opções da pergunta. Adicione uma nova para poder remover esta.', 'warning');
  }
};

const rules = {
  required: (value: any) => !!value || 'Campo obrigatório.',
  rateRange: (v: number) => (v >= 3 && v <= 10) || 'O rate deve ser entre 3 e 10.',
  minTitle: (v: string) => v.length >= 3 || 'Mínimo 3 caracteres.',
};

async function onSubmit(formValues: Record<string, any>) {
  const payload: EvaluationPayload = {
    ...formValues,
    title: formValues.title || '',
    description: formValues.description || '',
    rate: formValues.rate || 5,
    created_by_user_uuid: userStore.user?.uuid || evaluationFormData.created_by_user_uuid,
    
    evaluation_topics: formValues.evaluation_topics.map((topic: any) => ({
      title: topic.title,
      description: topic.description,
      evaluation_questions: topic.evaluation_questions.map((question: any) => {
        const isSelection = [QuestionType.MULTI_CHOICE, QuestionType.SINGLE_CHOICE, QuestionType.DROPDOWN].includes(question.type);
        const options = isSelection && question.options.length > 0 ? question.options : [];
        return {
          title: question.title,
          description: question.description,
          type: question.type,
          options, 
        };
      })
    })),
  };

  try {
    if (isEditing.value && props.selectedEvaluation) {
      await evaluationStore.saveEvaluation(payload, props.selectedEvaluation.uuid);
      snackbarStore.show('Modelo de Avaliação atualizado com sucesso!', 'success');
    } else {
      await evaluationStore.saveEvaluation(payload);
      snackbarStore.show('Modelo de Avaliação adicionado com sucesso!', 'success');
    }
    close();
  } catch (err: any) {
    console.error('Erro no registro do modelo de avaliação:', err);
    snackbarStore.show(evaluationStore.error || 'Falha ao salvar modelo de avaliação.', 'error');
  }
}

function getIconQuestionType(questionType: QuestionType) {
  switch (questionType) {
    case QuestionType.SINGLE_CHOICE: return 'mdi-checkbox-blank-circle-outline';
    case QuestionType.MULTI_CHOICE: return 'mdi-checkbox-blank-outline';
    case QuestionType.DROPDOWN: return 'mdi-arrow-down-drop-circle-outline';
    default: 'mdi-checkbox-blank-circle-outline';
  }
}

function onChangeQuestionType(question: EvaluationQuestion) {
  question = {
    ...question,
    options: question.options?.map((opt, index) => 
      typeof opt === 'string' 
        ? { uuid: undefined, text: opt, order: index + 1 }
        : opt
    ) || []
  };

  setTimeout(() => {
    evaluationFormData.evaluation_topics.forEach((topic, topicIndex) => {
      topic.evaluation_questions.forEach((item, questionIndex) => {
        item.options?.forEach((option, optionIndex) => {
          const input = document.querySelector(`#evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_options_${optionIndex}_text`) as HTMLInputElement;
          if(input && option.text !== '') {
            input.value = option.text;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })
      })
    })
  }, 50)
}

function handleDrdChange(newValue: any) {
  if (!newValue) {
    const defaultTopics = [{
      uuid: undefined,
      title: '',
      description: '',
      order: 1,
      evaluation_questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, order: 1, options: [] }]
    }];

    evaluationFormData.evaluation_topics = defaultTopics;
    evaluationFormData.rate = 5;

    setTimeout(() => {
      forceUpdateVeeValidate()
    }, 50)
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="800px">
    <Form @submit="onSubmit" :initial-values="evaluationFormData">
      <v-card>
        <v-card-title class="text-h6">
          {{ !!selectedEvaluation?.uuid ? 'Editar Modelo de Avaliação' : 'Novo Modelo de Avaliação' }}
        </v-card-title>
        <v-card-text>
          <v-container class="pt-0">
            <v-row>
              <v-col cols="12" class="pb-0">
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
              <v-col cols="12" class="pb-0">
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

              <v-divider  />

              <v-col cols="12" sm="12">
                <v-radio-group v-model="evaluationMode" hide-details>
                  <div class="d-flex gap-2">
                    <v-card
                      variant="tonal"
                      color="primary"
                      class="pa-4 w-100 border-blue-custom"
                      :border="isDrdSelected ? 'success md' : 'primary sm'"
                    >
                      <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
                        <div>Criar avaliação a partir de um DRD</div>
                        <div>
                          <v-radio value="fromDRD"></v-radio>
                        </div>
                      </v-card-title>
                      <v-card-text class="pa-0">
                        <p class="mb-3 text-caption">Vincular a um DRD preexistente preencherá automaticamente os tópicos, as questões e a escala de rate do formulário, garantindo alinhamento com os cargos da empresa.</p>
  
                        <Field name="drd_uuid" label="DRD Base (Opcional)" v-slot="{ field, errorMessage }">
                          <v-select
                            v-bind="field"
                            v-model="evaluationFormData.drd_uuid"
                            :items="drdStore.drdOptions"
                            item-title="title"
                            item-value="value"
                            label="Escolha um DRD"
                            variant="solo-filled"
                            density="compact"
                            clearable
                            :disabled="evaluationMode === 'fromZero'"
                            :error="!!errorMessage"
                            :error-messages="errorMessage"
                            :loading="drdStore.loading"
                            @update:modelValue="handleDrdChange"
                          />
                        </Field>
                      </v-card-text>
                    </v-card>
                    <v-card
                      variant="outlined"
                      class="pa-4 w-100"
                      :border="isDrdSelected ? 'primary md' : 'gray sm'"
                    >
                      <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
                        <div>Criar avaliação do zero</div>
                        <div>
                          <v-radio value="fromZero"></v-radio>
                        </div>
                      </v-card-title>
                      <v-card-text class="pa-0">
                        <p class="mb-3 text-caption">Criar uma avaliação do zero dará mais trabalho para você, mas também mais liberdade para criar tópicos e questões personalizados.</p>
                      </v-card-text>
                    </v-card>
                  </div>
                </v-radio-group>
              </v-col>

              <v-col cols="12" sm="12">
                <small>Defina a escala máxima que será usada em todas as perguntas do tipo Classificação (<v-icon>mdi-star-outline</v-icon>).</small>
                <Field name="rate" label="Rate da Avaliação" rules="required" v-slot="{ field, errorMessage }">
                  <div class="d-flex align-center">
                    <v-rating
                      v-bind="field"
                      v-model="evaluationFormData.rate"
                      color="primary"
                      density="compact"
                      half-increments
                      hover
                      :length="5"
                      size="x-large"
                    ></v-rating>
                    <span class="ml-2 text-h6">{{ evaluationFormData.rate }}</span>
                  </div>
                  <v-messages v-if="errorMessage" :value="[errorMessage]" color="error"></v-messages>
                </Field>
              </v-col>

              <v-divider class="my-4" />

              <h3 class="text-subtitle-1 mb-3">Estrutura do Formulário (Tópicos e Questões)</h3>

              <div v-if="evaluationFormData.evaluation_topics" class="w-100">
                  <div v-for="(topic, topicIndex) in evaluationFormData.evaluation_topics" :key="topicIndex" class="mb-4 pa-3 border rounded w-100">
                    <div class="d-flex align-start mb-2">
                      <div class="flex-grow-1">
                        <Field :name="`evaluation_topics[${topicIndex}].title`" :label="`Título do Tópico ${topicIndex + 1}`" :rules="rules.required" v-slot="{ field, errorMessage }">
                          <v-text-field
                            :id="`evaluation_topics_${topicIndex}_title`"
                            v-bind="field"
                            v-model="topic.title"
                            :label="`Título do Tópico ${topicIndex + 1}`"
                            variant="underlined"
                            density="compact"
                            persistent-placeholder
                            :error="!!errorMessage"
                            :error-messages="errorMessage"
                            class="mb-1 w-100"
                            :disabled="!!topic?.drd_topic_uuid"
                          />
                        </Field>
                        <Field :name="`evaluation_topics[${topicIndex}].description`" :label="`Descrição do Tópico ${topicIndex + 1}`" v-slot="{ field, errorMessage }">
                          <v-textarea
                            :id="`evaluation_topics_${topicIndex}_description`"
                            v-bind="field"
                            v-model="topic.description"
                            :label="`Descrição do Tópico ${topicIndex + 1} (Opcional)`"
                            variant="underlined"
                            density="compact"
                            persistent-placeholder
                            rows="2"
                            :error="!!errorMessage"
                            :error-messages="errorMessage"
                            class="mb-1 w-100"
                          />
                        </Field>
                      </div>
                      <v-btn
                        v-if="evaluationFormData.evaluation_topics.length > 1"
                        icon
                        variant="text"
                        color="error"
                        @click="removeEvaluationTopic(topicIndex)"
                        size="small"
                        class="mt-2 ml-2"
                        :disabled="!!topic?.drd_topic_uuid"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>

                    <h4 class="text-subtitle-2 ml-4 mb-2">Questões do Tópico</h4>
                    <div v-if="topic.evaluation_questions">
                      <div v-for="(question, questionIndex) in topic.evaluation_questions" :key="questionIndex" class="pa-3 border rounded ml-4 mb-3">
                        <div class="d-flex align-start">
                          <div class="flex-grow-1">
                            <div class="d-flex gap-2">
                              <Field :name="`evaluation_topics[${topicIndex}].evaluation_questions[${questionIndex}].title`" :label="`Título da Questão ${questionIndex + 1}`" :rules="rules.required" v-slot="{ field, errorMessage }">
                                <v-textarea
                                  :id="`evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_title`"
                                  v-bind="field"
                                  v-model="question.title"
                                  :label="`Título da Questão ${questionIndex + 1}`"
                                  variant="underlined"
                                  density="compact"
                                  :error="!!errorMessage"
                                  :error-messages="errorMessage"
                                  auto-grow
                                  rows="1"
                                  class="mb-1 w-100"
                                  :disabled="!!question?.drd_item_uuid"
                                  persistent-placeholder
                                />
                              </Field>
  
                              <Field :name="`evaluation_topics[${topicIndex}].evaluation_questions[${questionIndex}].type`" :label="`Tipo da Questão ${questionIndex + 1}`" :rules="rules.required" v-slot="{ field, errorMessage }">
                                <v-select
                                  :id="`evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_type`"
                                  v-bind="field"
                                  v-model="question.type"
                                  :items="frontendQuestionTypes"
                                  item-title="text"
                                  item-value="value"
                                  label="Tipo da Questão"
                                  variant="outlined"
                                  density="compact"
                                  :error="!!errorMessage"
                                  :error-messages="errorMessage"
                                  class="mb-1 question-type-select"
                                  :disabled="!!question?.drd_item_uuid"
                                  style="min-width: 226px; height: fit-content;"
                                  @update:model-value="onChangeQuestionType(question)"
                                >
                                  <template v-slot:append-inner>
                                    <v-tooltip text="Recomendamos o tipo 'Classificação' para métricas objetivas de DRD.">
                                      <v-icon icon="mdi-information-outline"></v-icon>
                                    </v-tooltip>
                                  </template>
  
                                  <template v-slot:item="{ props, item }">
                                    <v-list-item v-bind="props">
                                      <template #prepend>
                                        <v-icon :icon="item.raw.icon" class="mr-2"></v-icon>
                                      </template>
                                    </v-list-item>
                                  </template>
  
                                  <template v-slot:selection="{ item }">
                                    <v-icon :icon="item.raw.icon" class="mr-1"></v-icon>
                                    <span>{{ item.raw.text }}</span>
                                  </template>
                                </v-select>
                              </Field>
                            </div>

                            <Field :name="`evaluation_topics[${topicIndex}].evaluation_questions[${questionIndex}].description`" :label="`Descrição da Questão ${questionIndex + 1}`" v-slot="{ field, errorMessage }">
                              <v-textarea
                                :id="`evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_description`"
                                v-bind="field"
                                v-model="question.description"
                                :label="`Descrição da Questão ${questionIndex + 1} (Opcional)`"
                                variant="underlined"
                                density="compact"
                                persistent-placeholder
                                auto-grow
                                rows="2"
                                :error="!!errorMessage"
                                :error-messages="errorMessage"
                                class="mb-1 w-100"
                              />
                            </Field>

                            <div class="d-flex gap-4">
                              <div v-if="question.type === QuestionType.RATE" class="w-100">
                                <div class="d-flex align-center">
                                  <v-rating
                                    color="primary"
                                    density="compact"
                                    half-increments
                                    hover
                                    :length="evaluationFormData.rate"
                                    size="x-large"
                                    readonly
                                  ></v-rating>
                                  <span class="ml-2 text-h6">0</span>
                                </div>
                              </div>
  
                              <div v-if="question.type === QuestionType.SHORT_TEXT" class="w-100">
                                <v-text-field
                                  variant="underlined"
                                  density="compact"
                                  persistent-placeholder
                                  hide-details
                                  class="mb-1 w-100"
                                  readonly
                                />
                              </div>
  
                              <div v-if="question.type === QuestionType.LONG_TEXT" class="w-100">
                                <v-textarea
                                  variant="underlined"
                                  density="compact"
                                  persistent-placeholder
                                  hide-details
                                  rows="2"
                                  readonly
                                />
                              </div>
  
                              <div v-if="[QuestionType.MULTI_CHOICE, QuestionType.SINGLE_CHOICE, QuestionType.DROPDOWN].includes(question.type!)" class="w-100">
                                <h5 class="text-subtitle-2 ml-4 mb-2">Opções de Resposta</h5>
                                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="d-flex align-center ml-8 mb-2">
                                  <Field :name="`evaluation_topics[${topicIndex}].evaluation_questions[${questionIndex}].options[${optionIndex}].text`" :label="`Opção ${optionIndex + 1}`" :rules="rules.required" v-slot="{ field, errorMessage }">
                                    <v-text-field
                                      :id="`evaluation_topics_${topicIndex}_evaluation_questions_${questionIndex}_options_${optionIndex}_text`"
                                      v-bind="field"
                                      :model-value="option.text"
                                      @update:model-value="(val: string) => {
                                        option.text = val
                                      }"
                                      :label="`Opção ${optionIndex + 1}`"
                                      variant="underlined"
                                      density="compact"
                                      :prepend-icon="getIconQuestionType(question.type)"
                                      :error="!!errorMessage"
                                      :error-messages="errorMessage"
                                      class="mb-1 w-100"
                                    />
                                  </Field>
                                  <v-btn
                                    v-if="question.options && question.options.length > 1"
                                    icon
                                    variant="text"
                                    color="error"
                                    @click="removeQuestionOption(topicIndex, questionIndex, optionIndex)"
                                    size="small"
                                    class="ml-2"
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
                                >
                                  <v-icon left>mdi-plus</v-icon> Adicionar Opção
                                </v-btn>
                              </div>

                              <v-switch label="Obrigatório" hide-details style="min-width: 131px;"></v-switch>
                            </div>
                          </div>
                          
                          <v-btn
                            v-if="topic.evaluation_questions.length > 1"
                            icon
                            variant="text"
                            color="error"
                            @click="removeQuestion(topicIndex, questionIndex)"
                            size="small"
                            class="ml-2 mt-2"
                            :disabled="!!question?.drd_item_uuid"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </div>
                    
                    <v-btn
                      color="primary"
                      variant="outlined"
                      @click="addQuestion(topicIndex)"
                      class="mt-2 ml-4"
                      size="small"
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

            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit">{{ isEditing ? 'Salvar Alterações' : 'Criar Modelo' }}</v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.border-blue-custom {
  border-color: var(--v-theme-primary) !important;
}
.rounded {
  border-radius: 4px;
}
::v-deep(textarea) {
  font-size: 14px;
}
</style>
