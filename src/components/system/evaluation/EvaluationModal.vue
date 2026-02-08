<script setup lang="ts">
import { reactive, watch, computed, ref, nextTick } from 'vue';
import { Form, Field } from '@/plugins/vee-validate';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useDRDStore } from '@/stores/drd.store';
import { useUserStore } from '@/stores/auth.store';
import type Evaluation from '@/types/evaluation/evaluation.type';
import type EvaluationPayload from '@/types/evaluation/evaluation-payload.type';
import { QuestionType, type EvaluationQuestion } from '@/types/evaluation/evaluation-question.type';
import type EvaluationTopic from '@/types/evaluation/evaluation-topic.type';
import type EvaluationSimple from '@/types/evaluation/evaluation-simple.type';
import { questionTypesOptions } from '@/utils/questionType.util';

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
  name: props.selectedEvaluation?.name || '',
  description: props.selectedEvaluation?.description || '',
  created_by_user_uuid: props.selectedEvaluation?.created_by_user_uuid || userStore.user?.uuid || '',
  rate: props.selectedEvaluation?.rate || 5,
  drd_uuid: props.selectedEvaluation?.drd_uuid || undefined,
  form: props.selectedEvaluation?.form || {
    uuid: undefined,
    name: '',
    topics: [{
      uuid: undefined,
      title: '',
      description: '',
      order: 1,
      questions: [{
        uuid: undefined,
        title: '',
        description: '',
        type: QuestionType.RATE,
        is_required: true,
        order: 1,
        options: [{
          uuid: undefined,
          text: '',
          order: 1,
        }]
      }] 
    }]
  }
});

const evaluationMode = ref('fromDRD');

const isEditing = computed(() => !!props.selectedEvaluation?.uuid);
const isDrdSelected = computed(() => !!evaluationFormData.drd_uuid);
const showForm = computed(() => {
  const isDrdSelectedAndFormDRDOption = evaluationMode.value === 'fromDRD' && isDrdSelected.value
  if(evaluationFormData.form?.topics && (evaluationMode.value === 'fromZero' || isDrdSelectedAndFormDRDOption)) {
    return true;
  }
  return false;
});

function forceUpdateVeeValidate() {
  evaluationFormData.form?.topics?.forEach((topic, topicIndex) => {
    const inputTopicTitle = document.querySelector(`#topics_${topicIndex}_title`) as HTMLInputElement;
    if(inputTopicTitle && topic.title) {
      inputTopicTitle.value = topic.title;
      inputTopicTitle.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const inputTopicDescription = document.querySelector(`#topics_${topicIndex}_description`) as HTMLInputElement;
    if(inputTopicDescription) {
      inputTopicDescription.value = topic.description;
      inputTopicDescription.dispatchEvent(new Event('change', { bubbles: true }));
    }
    topic.questions.forEach((question, questionIndex) => {
      const inputQuestionTitle = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_title`) as HTMLInputElement;
      if(inputQuestionTitle && question.title) {
        inputQuestionTitle.value = question.title;
        inputQuestionTitle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputQuestionDescription = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_description`) as HTMLInputElement;
      if(inputQuestionDescription) {
        inputQuestionDescription.value = question.description;
        inputQuestionDescription.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputQuestionType = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_type`) as HTMLInputElement;
      if(inputQuestionType) {
        inputQuestionType.value = question.type;
        inputQuestionType.dispatchEvent(new Event('change', { bubbles: true }));
      }
      question.options?.forEach((option, optionIndex) => {
        const inputQuestionOption = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_options_${optionIndex}_text`) as HTMLInputElement;
        if(inputQuestionOption && option.text !== '') {
          inputQuestionOption.value = option.text;
          inputQuestionOption.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })
    })
  })
}

const getInitialEvaluationState = async (selectedEvaluation: EvaluationSimple | null): Promise<void> => {  
  try {
    let fetchedEvaluation: Evaluation | undefined;

    if (isEditing.value) {
      fetchedEvaluation = await evaluationStore.getEvaluation(selectedEvaluation!.uuid);
    }

    evaluationFormData.uuid = fetchedEvaluation?.uuid || undefined;
    evaluationFormData.name = fetchedEvaluation?.name || '';
    evaluationFormData.description = fetchedEvaluation?.description || '';
    evaluationFormData.created_by_user_uuid = fetchedEvaluation?.created_by_user_uuid || userStore.user?.uuid || '';
    evaluationFormData.rate = typeof fetchedEvaluation?.rate === 'number' ? fetchedEvaluation.rate : 5;
    evaluationFormData.drd_uuid = fetchedEvaluation?.drd?.uuid || undefined;
    evaluationFormData.form = fetchedEvaluation?.form || {
      uuid: undefined,
      name: '',
      topics: [{
        uuid: undefined,
        title: '',
        description: '',
        order: 1,
        questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, is_required: true, order: 1, options: [] }]
      }]
    };

    if(evaluationFormData) {
      setTimeout(() => {
        const inputName = document.querySelector(`#evaluation_name`) as HTMLInputElement;
        if(inputName && evaluationFormData?.name) {
          inputName.value = evaluationFormData.name;
          inputName.dispatchEvent(new Event('change', { bubbles: true }));
        }
  
        const inputDescription = document.querySelector(`#evaluation_description`) as HTMLInputElement;
        if(inputDescription && evaluationFormData?.description) {
          inputDescription.value = evaluationFormData.description;
          inputDescription.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const inputDrdUuid = document.querySelector(`#evaluation_drd_uuid`) as HTMLInputElement;
        if(inputDrdUuid && evaluationFormData?.drd_uuid) {
          inputDrdUuid.value = evaluationFormData.drd_uuid;
          inputDrdUuid.dispatchEvent(new Event('change', { bubbles: true }));
        }

        forceUpdateVeeValidate()
      }, 50)
    }
  } catch (err) {
    console.error(err);
  }
}

watch(() => props.selectedEvaluation, async (val) => {
  getInitialEvaluationState(val ?? null)
}, { immediate: true });

watch(() => evaluationFormData.drd_uuid, async (newDrdUuid) => {
  const defaultTopics = [{
    uuid: undefined,
    title: '',
    description: '',
    order: 1,
    questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, is_required: true, order: 1, options: [] }]
  }];

  if (newDrdUuid && !props.selectedEvaluation?.drd?.uuid) {
    try {
      const fullDrd = await drdStore.getDRD(newDrdUuid);

      if (fullDrd) {
        evaluationFormData.rate = fullDrd.rate;
        evaluationFormData.form.topics = fullDrd.drdTopics?.map((drdTopic, drdTopicIndex) => ({
          uuid: undefined,
          drd_topic_uuid: drdTopic.uuid,
          title: drdTopic.name,
          description: '',
          order: drdTopicIndex + 1,
          questions: drdTopic.drdTopicItems?.map((drdItem, drdItemIndex) => ({
            uuid: undefined,
            drd_topic_item_uuid: drdItem.uuid,
            title: drdItem.name,
            description: '',
            type: QuestionType.RATE,
            is_required: true,
            order: drdItemIndex + 1,
            options: []
          }))
        }));
        setTimeout(() => {
          forceUpdateVeeValidate()
        }, 50)
      }
    } catch (error) {
      console.error('Erro ao buscar Descritivo de Cargo:', error);
      if (!isEditing.value) {
        evaluationFormData.form.topics = defaultTopics;
        evaluationFormData.rate = 5;
      }
    }
  } else if (!isEditing.value) {
    evaluationFormData.form.topics = defaultTopics;
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
    questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, is_required: true, order: 1, options: [] }]
  }];

  if(newVal === 'fromZero') {
    evaluationFormData.form.topics = defaultTopics;
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
  evaluationFormData.form.topics.push({
    uuid: undefined,
    title: '',
    description: '',
    order: evaluationFormData.form.topics.length + 1,
    questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, is_required: true, order: 1, options: [] }]
  });
};

const removeEvaluationTopic = (index: number) => {
  if (evaluationFormData.form.topics.length > 1) {
    evaluationFormData.form.topics.splice(index, 1);

    evaluationFormData.form.topics.forEach((topic, topicIndex) => {
      topic.order = topicIndex + 1;
    })

    forceUpdateVeeValidate()
  } else {
    snackbarStore.show('Não é possível remover todos os tópicos. Adicione um novo para poder remover este.', 'warning');
  }
};

const addQuestion = (topicIndex: number) => {
  evaluationFormData.form.topics[topicIndex].questions.push({
    uuid: undefined,
    title: '',
    description: '',
    type: QuestionType.RATE,
    is_required: true,
    order: 1,
    options: []
  });

  setTimeout(() => {
    evaluationFormData.form.topics[topicIndex].questions.forEach((question, questionIndex) => {
      const inputQuestionType = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_type`) as HTMLInputElement;
      if(inputQuestionType) {
        inputQuestionType.value = question.type;
        inputQuestionType.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })
  }, 50);
};

const removeQuestion = (topicIndex: number, questionIndex: number) => {
  if (evaluationFormData.form.topics[topicIndex].questions.length > 1) {
    evaluationFormData.form.topics[topicIndex].questions.splice(questionIndex, 1);

    evaluationFormData.form.topics[topicIndex].questions.forEach((question, questionIndex) => {
      question.order = questionIndex + 1;
    });

    evaluationFormData.form.topics[topicIndex].questions.forEach((question, questionIndex) => {
      const inputQuestionTitle = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_title`) as HTMLInputElement;
      if(inputQuestionTitle) {
        inputQuestionTitle.value = question.title;
        inputQuestionTitle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputQuestionDescription = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_description`) as HTMLInputElement;
      if(inputQuestionDescription) {
        inputQuestionDescription.value = question.description;
        inputQuestionDescription.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputQuestionType = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_type`) as HTMLInputElement;
      if(inputQuestionType) {
        inputQuestionType.value = question.type;
        inputQuestionType.dispatchEvent(new Event('change', { bubbles: true }));
      }
      question.options?.forEach((option, optionIndex) => {
        const inputQuestionOption = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_options_${optionIndex}_text`) as HTMLInputElement;
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
  const question = evaluationFormData.form.topics[topicIndex].questions[questionIndex];
  question.options?.push({ uuid: undefined, text: '', order: question.options.length + 1 });
};

const removeQuestionOption = (topicIndex: number, questionIndex: number, optionIndex: number) => {
  const question = evaluationFormData.form.topics[topicIndex].questions[questionIndex];
  if (question.options && question.options.length > 1) {
    question.options.splice(optionIndex, 1);

    question.options.forEach((option, idx) => {
      option.order = idx + 1;
    });

    question.options?.forEach((option, optionIndex) => {
      const inputQuestionOption = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_options_${optionIndex}_text`) as HTMLInputElement;
      if(inputQuestionOption && option.text !== '') {
        inputQuestionOption.value = option.text;
        inputQuestionOption.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })
  } else {
    snackbarStore.show('Não é possível remover todas as opções da pergunta. Adicione uma nova para poder remover esta.', 'warning');
  }
};

async function onSubmit(formValues: Record<string, any>) {
  const payload: EvaluationPayload = {
    ...formValues,
    name: formValues.name || '',
    description: formValues.description || '',
    rate: evaluationFormData?.rate || 5,
    created_by_user_uuid: userStore.user?.uuid || evaluationFormData.created_by_user_uuid,
    form: {
      uuid: evaluationFormData?.form?.uuid,
      name: formValues.name + ' - Formulário',
      topics: evaluationFormData?.form?.topics?.map((topic: EvaluationTopic, indexTopic) => ({
        uuid: topic.uuid,
        drd_topic_uuid: topic.drd_topic_uuid,
        title: topic.title,
        description: topic.description,
        order: indexTopic + 1,
        questions: topic?.questions?.map((question: EvaluationQuestion, indexQuestion) => {
          const isSelection = [QuestionType.MULTI_CHOICE, QuestionType.SINGLE_CHOICE, QuestionType.DROPDOWN].includes(question.type);
          const options = isSelection && question?.options && question.options?.length > 0 ? question.options : [];
          return {
            uuid: question.uuid,
            drd_topic_item_uuid: question.drd_topic_item_uuid,
            title: question.title,
            description: question.description,
            type: question.type,
            is_required: question.is_required,
            order: indexQuestion + 1,
            options
          };
        })
      }))
    }
  };

  try {
    if (isEditing.value && props.selectedEvaluation) {
      await evaluationStore.saveEvaluation(payload, props.selectedEvaluation.uuid, props.selectedEvaluation.drd);
      snackbarStore.show('Modelo de Avaliação atualizado com sucesso!', 'success');
    } else {
      await evaluationStore.saveEvaluation(payload, undefined, props.selectedEvaluation?.drd);
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
    evaluationFormData.form.topics.forEach((topic, topicIndex) => {
      topic.questions.forEach((item, questionIndex) => {
        item.options?.forEach((option, optionIndex) => {
          const input = document.querySelector(`#topics_${topicIndex}_questions_${questionIndex}_options_${optionIndex}_text`) as HTMLInputElement;
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
      questions: [{ uuid: undefined, title: '', description: '', type: QuestionType.RATE, is_required: true, order: 1, options: [] }]
    }];

    evaluationFormData.form.topics = defaultTopics;
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
                <Field name="name" label="Nome do Modelo de Avaliação" rules="required|min:3" v-slot="{ field, errorMessage }">
                  <v-text-field
                    id="evaluation_name"
                    v-bind="field"
                    v-model="evaluationFormData.name"
                    label="Nome do Modelo de Avaliação"
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
                    id="evaluation_description"
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

              <v-divider />

              <v-col cols="12" sm="12">
                <v-radio-group v-model="evaluationMode" hide-details>
                  <div class="d-flex gap-2">
                    <v-card
                      variant="tonal"
                      color="primary"
                      class="pa-4 w-100 border-blue-custom"
                    >
                      <v-card-title class="pa-0 mb-2 text-subtitle-1 d-flex justify-space-between">
                        <div>Criar avaliação a partir de um Descritivo de Cargo</div>
                        <div>
                          <v-radio value="fromDRD"></v-radio>
                        </div>
                      </v-card-title>
                      <v-card-text class="pa-0">
                        <p class="mb-3 text-caption">Vincular a um Descritivo de Cargo preexistente preencherá automaticamente os tópicos, as questões e a escala de rate do formulário, garantindo alinhamento com os cargos da empresa.</p>
  
                        <Field name="drd_uuid" label="Descritivo de Cargo Base (Opcional)" v-slot="{ field, errorMessage }">
                          <v-select
                            id="evaluation_drd_uuid"
                            v-bind="field"
                            v-model="evaluationFormData.drd_uuid"
                            :items="drdStore.drdOptions"
                            item-title="title"
                            item-value="value"
                            label="Escolha um Descritivo de Cargo"
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

              <h3 v-if="showForm" class="text-subtitle-1 mb-3">Estrutura do Formulário</h3>

              <div v-if="showForm" class="w-100">
                  <div v-for="(topic, topicIndex) in evaluationFormData.form.topics" :key="topicIndex" class="mb-4 pa-3 border rounded w-100">
                    <div class="d-flex align-start mb-2">
                      <div class="flex-grow-1">
                        <Field :name="`form.topics[${topicIndex}].title`" :label="`Título do Tópico ${topicIndex + 1}`" rules="required" v-slot="{ field, errorMessage }">
                          <v-text-field
                            :id="`topics_${topicIndex}_title`"
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
                        <Field :name="`form.topics[${topicIndex}].description`" :label="`Descrição do Tópico ${topicIndex + 1}`" v-slot="{ field, errorMessage }">
                          <v-textarea
                            :id="`topics_${topicIndex}_description`"
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
                        v-if="evaluationFormData?.form?.topics.length > 1"
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
                    <div v-if="topic?.questions">
                      <div v-for="(question, questionIndex) in topic.questions" :key="questionIndex" class="pa-3 border rounded ml-4 mb-3">
                        <div class="d-flex align-start">
                          <div class="flex-grow-1">
                            <div class="d-flex gap-2">
                              <Field :name="`form.topics[${topicIndex}].questions[${questionIndex}].title`" :label="`Título da Questão ${questionIndex + 1}`" rules="required" v-slot="{ field, errorMessage }">
                                <v-textarea
                                  :id="`topics_${topicIndex}_questions_${questionIndex}_title`"
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
                                  :disabled="!!question?.drd_topic_item_uuid"
                                  persistent-placeholder
                                />
                              </Field>
  
                              <Field :name="`form.topics[${topicIndex}].questions[${questionIndex}].type`" :label="`Tipo da Questão ${questionIndex + 1}`" rules="required" v-slot="{ field, errorMessage }">
                                <v-select
                                  :id="`topics_${topicIndex}_questions_${questionIndex}_type`"
                                  v-bind="field"
                                  v-model="question.type"
                                  :items="questionTypesOptions"
                                  item-title="text"
                                  item-value="value"
                                  label="Tipo da Questão"
                                  variant="outlined"
                                  density="compact"
                                  :error="!!errorMessage"
                                  :error-messages="errorMessage"
                                  class="mb-1 question-type-select"
                                  :disabled="!!question?.drd_topic_item_uuid"
                                  style="min-width: 226px; height: fit-content;"
                                  @update:model-value="onChangeQuestionType(question)"
                                >
                                  <template v-slot:append-inner>
                                    <v-tooltip text="Recomendamos o tipo 'Classificação' para métricas objetivas de Descritivo de Cargo.">
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

                            <Field :name="`form.topics[${topicIndex}].questions[${questionIndex}].description`" :label="`Descrição da Questão ${questionIndex + 1}`" v-slot="{ field, errorMessage }">
                              <v-textarea
                                :id="`topics_${topicIndex}_questions_${questionIndex}_description`"
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
                                  <Field :name="`form.topics[${topicIndex}].questions[${questionIndex}].options[${optionIndex}].text`" :label="`Opção ${optionIndex + 1}`" rules="required" v-slot="{ field, errorMessage }">
                                    <v-text-field
                                      :id="`topics_${topicIndex}_questions_${questionIndex}_options_${optionIndex}_text`"
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

                              <v-switch
                                v-model="question.is_required"
                                label="Obrigatório"
                                hide-details
                                style="min-width: 131px; align-items: self-end;"
                                color="primary"
                                :disabled="!!question?.drd_topic_item_uuid"
                              />
                            </div>
                          </div>
                          
                          <v-btn
                            v-if="topic?.questions?.length > 1"
                            icon
                            variant="text"
                            color="error"
                            @click="removeQuestion(topicIndex, questionIndex)"
                            size="small"
                            class="ml-2 mt-2"
                            :disabled="!!question?.drd_topic_item_uuid"
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
                v-if="showForm"
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
