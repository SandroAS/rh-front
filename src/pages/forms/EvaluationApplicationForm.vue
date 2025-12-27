<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
import type { EvaluationApplicationForm } from '@/types/evaluationApplication/evaluation-application.type';
import getApplicationTypeName from '@/utils/getApplicationTypeName.util';
import { QuestionType } from '@/types/evaluation/evaluation-question.type';
import { getInitials } from '@/utils/getInitialsFromName.util';
import type FormAnswer from '@/types/formAnswer/form-answer.type';
import { useFormResponseStore } from '@/stores/form-response.store';
import type FormResponsePayload from '@/types/formResponse/form-response-payload.type';

const evaluationApplicationStore = useEvaluationApplicationStore();
const formResponseStore = useFormResponseStore();
const snackbarStore = useSnackbarStore();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const evaluationApplication = ref<EvaluationApplicationForm | null>(null);

const formAnswers = ref<Record<string, any>>({});

const evaluationApplicationUuid = route.params.uuid as string;
const form = computed(() => evaluationApplication.value?.formApplication);

const getInitialValue = (type: QuestionType) => {
  switch (type) {
    case QuestionType.MULTI_CHOICE:
      return [];
    case QuestionType.RATE:
      return 0;
    default:
      return null;
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    const response = await evaluationApplicationStore.getEvaluationApplication(evaluationApplicationUuid);

    if (response) {
      evaluationApplication.value = response;

      response.formApplication?.topics.forEach(topic => {
        topic.questions.forEach(question => {
          if (question.uuid) {
            formAnswers.value[question.uuid] = getInitialValue(question.type as QuestionType);
          }
        });
      });
    }
  } catch (error) {
    console.error('Erro ao carregar avaliação:', error);
    snackbarStore.show('Erro ao carregar o formulário de avaliação.', 'error');
  } finally {
    loading.value = false;
  }
});

const isFormValid = computed(() => {
  if (!form.value) return false;
  for (const topic of form.value.topics) {
    for (const question of topic.questions) {
      if (question.is_required) {
        const answer = formAnswers.value[question.uuid as string];
        if (question.type === QuestionType.MULTI_CHOICE) {
          if (!answer || answer.length === 0) return false;
        } else if (question.type === QuestionType.RATE) {
          if (answer === 0 || answer === null) return false;
        } else {
          if (answer === null || answer === '') return false;
        }
      }
    }
  }
  return true;
});

async function submitEvaluation() {
  if (!isFormValid.value) {
    snackbarStore.show('Por favor, preencha todos os campos obrigatórios.', 'warning');
    return;
  }

  try {
    submitting.value = true;
    const answers: FormAnswer[] = [];

    form.value?.topics.forEach(topic => {
      topic.questions.forEach(question => {
        const rawValue = formAnswers.value[question.uuid as string];
        
        if (rawValue === null || rawValue === undefined || (Array.isArray(rawValue) && rawValue.length === 0)) {
          return;
        }

        const answerEntry: FormAnswer = {
          application_question_uuid: question.uuid as string
        };

        switch (question.type) {
          case QuestionType.SHORT_TEXT:
          case QuestionType.LONG_TEXT:
            answerEntry.text_value = String(rawValue);
            break;

          case QuestionType.RATE:
            answerEntry.number_value = Number(rawValue);
            break;

          case QuestionType.SINGLE_CHOICE:
          case QuestionType.DROPDOWN:
            answerEntry.application_option_uuid = String(rawValue);
            break;

          case QuestionType.MULTI_CHOICE:
            answerEntry.multiOptions = (rawValue as string[]).map(uuid => ({
              application_option_uuid: uuid
            }));
            break;
        }

        answers.push(answerEntry);
      });
    });

    const payload: FormResponsePayload = {
      is_completed: true,
      answers: answers
    };
    
    await formResponseStore.submitAnswers(evaluationApplicationUuid, payload);

    snackbarStore.show('Avaliação enviada com sucesso!', 'success');
    router.push('/system/dashboard');
  } catch (error) {
    console.error('Erro ao enviar:', error);
    snackbarStore.show('Erro ao enviar sua avaliação.', 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <v-container v-if="loading" class="fill-height d-flex align-center justify-center">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </v-container>

  <v-container v-else-if="evaluationApplication && form" class="py-8">
    <v-card class="pa-0 mx-auto overflow-hidden" max-width="900" elevation="3" rounded="lg">

      <!-- Banner Superior -->
      <v-sheet color="primary" height="10" width="100%"></v-sheet>

      <div class="pa-8">
        <!-- Cabeçalho -->
        <header class="mb-8">
          <h1 class="text-h4 font-weight-bold mb-2">{{ evaluationApplication.evaluation?.name }} {{ 
              evaluationApplication.evaluation?.drd ? (' - DRD: ' + evaluationApplication.evaluation?.drd?.jobPosition?.title) : ''
            }}
          </h1>

          <p v-if="form.description" class="text-body-1 text-medium-emphasis mb-6">
            {{ form.description }}
          </p>

          <v-divider class="mb-6"></v-divider>

          <v-row align="center">
            <v-col cols="12">
              <div class="d-md-flex justify-space-between gap-4">
                <div class="mb-2">
                  <h3>Avaliado:</h3>
                  <div class="d-flex align-center gap-2">
                    <v-img 
                      v-if="evaluationApplication.evaluated_user?.profile_img_url" 
                      :src="evaluationApplication.evaluated_user.profile_img_url"
                    ></v-img>
                    <v-avatar v-else color="primary">
                      <span class="text-white">{{ getInitials(evaluationApplication.evaluated_user.name) }}</span>
                    </v-avatar>
                    <div class="">
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ evaluationApplication.evaluated_user?.name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ evaluationApplication.evaluated_user?.email }}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3>Tipo de avaliação:</h3>
                  <v-chip size="large" color="primary" variant="flat" class="mt-1">
                    {{ getApplicationTypeName(evaluationApplication.type) }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </header>

        <!-- Tópicos -->
        <div v-for="(topic, tIdx) in form.topics" :key="topic.uuid" class="mb-12">
          <div class="topic-header mb-6">
            <h2 class="text-h5 font-weight-bold text-primary">
              {{ tIdx + 1 }}. {{ topic.title }}
            </h2>
            <p v-if="topic.description" class="text-body-2 text-medium-emphasis mt-1">
              {{ topic.description }}
            </p>
          </div>

          <!-- Questões -->
          <v-card 
            variant="flat" 
            v-for="question in topic.questions" 
            :key="question.uuid" 
            class="mb-6 pa-6 border rounded-lg"
          >
            <div class="mb-4">
              <div class="text-subtitle-1 font-weight-bold mb-1">
                {{ question.title }}
                <span v-if="question.is_required" class="text-error" title="Obrigatório">*</span>
              </div>
              <div v-if="question.description" class="text-body-2 text-medium-emphasis">
                {{ question.description }}
              </div>
            </div>

            <!-- INPUTS BASEADOS NO TIPO -->
            <div class="question-input-container">

              <!-- RATE (Estrelas ou Números) -->
              <template v-if="question.type === QuestionType.RATE">
                <div class="d-flex align-center flex-column">
                  <v-rating
                    v-model="formAnswers[question.uuid!]"
                    color="amber-darken-3"
                    active-color="amber-darken-3"
                    hover
                    density="comfortable"
                    size="x-large"
                    :length="5"
                  ></v-rating>
                  <span class="text-caption mt-2 font-weight-bold">
                    Nota: {{ formAnswers[question.uuid!] || 0 }} / 5
                  </span>
                </div>
              </template>

              <!-- SHORT_TEXT -->
              <template v-else-if="question.type === QuestionType.SHORT_TEXT">
                <v-text-field
                  v-model="formAnswers[question.uuid!]"
                  variant="outlined"
                  density="compact"
                  placeholder="Resposta curta..."
                  hide-details
                ></v-text-field>
              </template>

              <!-- LONG_TEXT -->
              <template v-else-if="question.type === QuestionType.LONG_TEXT">
                <v-textarea
                  v-model="formAnswers[question.uuid!]"
                  variant="outlined"
                  placeholder="Escreva detalhadamente sua resposta..."
                  rows="4"
                  auto-grow
                  hide-details
                ></v-textarea>
              </template>

              <!-- SINGLE_CHOICE / RADIO -->
              <template v-else-if="question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.DROPDOWN">
                <v-select
                  v-if="question.type === QuestionType.DROPDOWN || (question.options?.length || 0) > 5"
                  v-model="formAnswers[question.uuid!]"
                  :items="question.options"
                  item-title="text"
                  item-value="uuid"
                  label="Selecione uma opção"
                  variant="outlined"
                  density="compact"
                ></v-select>
                
                <v-radio-group v-else v-model="formAnswers[question.uuid!]">
                  <v-radio
                    v-for="opt in question.options"
                    :key="opt.uuid"
                    :label="opt.text"
                    :value="opt.uuid"
                    color="primary"
                  ></v-radio>
                </v-radio-group>
              </template>

              <!-- MULTI_CHOICE -->
              <template v-else-if="question.type === QuestionType.MULTI_CHOICE">
                <div class="d-flex flex-column gap-1">
                  <v-checkbox
                    v-for="opt in question.options"
                    :key="opt.uuid"
                    v-model="formAnswers[question.uuid!]"
                    :label="opt.text"
                    :value="opt.uuid"
                    color="primary"
                    density="compact"
                    hide-details
                  ></v-checkbox>
                </div>
              </template>

            </div>
          </v-card>
        </div>
        
        <v-divider class="my-8"></v-divider>

        <!-- Rodapé de Ações -->
        <div class="d-flex flex-column flex-sm-row justify-end gap-4">
          <v-btn 
            variant="text" 
            to="/system/dashboard" 
            :disabled="submitting"
          >
            Sair sem salvar
          </v-btn>
          <v-btn 
            color="primary"
            elevation="1"
            :disabled="!isFormValid"
            :loading="submitting"
            @click="submitEvaluation"
            class="px-12"
          >
            Enviar Avaliação
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>

  <!-- Estado de Erro -->
  <v-container v-else class="fill-height d-flex align-center justify-center">
    <v-alert
      type="error"
      variant="tonal"
      max-width="500"
      title="Formulário não encontrado"
      text="Não foi possível carregar os dados desta avaliação. Pode ser que o link tenha expirado ou a avaliação já tenha sido enviada."
    >
      <template #append>
        <v-btn color="error" variant="flat" to="/dashboard">Voltar ao Início</v-btn>
      </template>
    </v-alert>
  </v-container>
</template>

<style scoped>
.topic-header {
  border-left: 6px solid rgb(var(--v-theme-primary));
  padding-left: 20px;
}

.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.gap-1 {
  gap: 4px;
}
.gap-4 {
  gap: 16px;
}

/* Transição suave para o rating */
:deep(.v-rating__item) {
  transition: transform 0.2s ease;
}
:deep(.v-rating__item:hover) {
  transform: scale(1.2);
}
</style>
