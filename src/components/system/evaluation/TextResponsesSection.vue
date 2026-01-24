<script setup lang="ts">
import { ref, computed } from 'vue';
import type EvaluationMetricApplication from '@/types/evaluationMetrics/evaluation-metric-application.type';
import type EvaluationMetricAnswer from '@/types/evaluationMetrics/evaluation-metric-answer.type';
import getApplicationTypeName from '@/utils/getApplicationTypeName.util';

interface Props {
  applications: EvaluationMetricApplication[];
}

const props = defineProps<Props>();

const expandedQuestions = ref<number[]>([]);
const expandedUsers = ref<Record<number, string[]>>({});

// Função para garantir que cada pergunta tenha seu array de usuários expandidos inicializado
const getExpandedUsersForQuestion = (baseQuestionId: number): string[] => {
  if (!expandedUsers.value[baseQuestionId]) {
    expandedUsers.value[baseQuestionId] = [];
  }
  return expandedUsers.value[baseQuestionId];
};

interface GroupedTextAnswer {
  questionTitle: string;
  baseQuestionId: number;
  evaluatedUsers: {
    evaluatedUserName: string;
    evaluatedUserEmail: string;
    answers: Array<{
      answer: EvaluationMetricAnswer;
      submittingUserName: string;
      applicationType: string;
    }>;
  }[];
}

const groupedTextAnswers = computed<GroupedTextAnswer[]>(() => {
  const questionMap: Record<number, {
    questionTitle: string;
    baseQuestionId: number;
    userMap: Record<string, {
      evaluatedUserName: string;
      evaluatedUserEmail: string;
      answers: Array<{
        answer: EvaluationMetricAnswer;
        submittingUserName: string;
        applicationType: string;
      }>;
    }>;
  }> = {};

  props.applications.forEach((app) => {
    app.formResponses?.forEach((response) => {
      response.answers?.forEach((answer) => {
        if ((['SHORT_TEXT', 'LONG_TEXT', 'TEXT'].includes(answer.question?.type as string)) && answer.text_value) {
          const baseQuestionId = answer.question?.base_question_id;
          if (!baseQuestionId) return; // Pula se não tiver base_question_id
          
          const questionTitle = answer.question.title;
          const evaluatedUserName = app.evaluated_user?.name || 'Desconhecido';
          const evaluatedUserEmail = app.evaluated_user?.email || '';
          const submittingUserName = app.submitting_user?.name || 'Desconhecido';
          const applicationType = getApplicationTypeName(app.type);

          if (!questionMap[baseQuestionId]) {
            questionMap[baseQuestionId] = {
              questionTitle,
              baseQuestionId,
              userMap: {}
            };
          }

          if (!questionMap[baseQuestionId].userMap[evaluatedUserName]) {
            questionMap[baseQuestionId].userMap[evaluatedUserName] = {
              evaluatedUserName,
              evaluatedUserEmail,
              answers: []
            };
          }

          questionMap[baseQuestionId].userMap[evaluatedUserName].answers.push({
            answer,
            submittingUserName,
            applicationType
          });
        }
      });
    });
  });

  return Object.values(questionMap).map(question => ({
    questionTitle: question.questionTitle,
    baseQuestionId: question.baseQuestionId,
    evaluatedUsers: Object.values(question.userMap)
  }));
});

const hasTextResponses = computed(() => {
  return groupedTextAnswers.value.length > 0;
});
</script>

<template>
  <v-col v-if="hasTextResponses" cols="12" lg="12">
    <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="blue" class="mr-2">mdi-message-text-outline</v-icon>
      Respostas de texto aberto
    </h3>
    <v-expansion-panels v-model="expandedQuestions" variant="accordion" multiple>
      <v-expansion-panel
        v-for="group in groupedTextAnswers"
        :key="group.baseQuestionId"
        :value="group.baseQuestionId"
      >
        <v-expansion-panel-title>
          <div class="d-flex justify-space-between w-100 pr-4 align-center">
            <span class="font-weight-medium">{{ group.questionTitle }}</span>
            <v-chip size="small" color="primary" variant="outlined">
              {{ group.evaluatedUsers.length }} {{ group.evaluatedUsers.length === 1 ? 'pessoa avaliada' : 'pessoa avaliadas' }}
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-expansion-panels 
            :model-value="getExpandedUsersForQuestion(group.baseQuestionId)"
            @update:model-value="(val) => expandedUsers[group.baseQuestionId] = val as string[]"
            variant="accordion" 
            multiple
            class="mt-2"
          >
            <v-expansion-panel
              v-for="userGroup in group.evaluatedUsers"
              :key="`${group.baseQuestionId}-${userGroup.evaluatedUserName}`"
              :value="`${group.baseQuestionId}-${userGroup.evaluatedUserName}`"
            >
              <v-expansion-panel-title>
                <div class="d-flex justify-space-between w-100 pr-4 align-center">
                  <span class="font-weight-medium text-primary">{{ userGroup.evaluatedUserName }}</span>
                  <v-chip size="small" color="success" variant="outlined">
                    {{ userGroup.answers.length }} {{ userGroup.answers.length === 1 ? 'resposta' : 'respostas' }}
                  </v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-list density="compact" class="mt-2">
                  <v-list-item
                    v-for="(item, idx) in userGroup.answers"
                    :key="`${item.answer.uuid}-${idx}`"
                    class="px-0 mb-3"
                  >
                    <v-list-item-title class="text-caption font-weight-bold text-grey-darken-2 mb-1">
                      {{ item.applicationType }} - {{ item.submittingUserName }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 bg-white pa-3 rounded border-s-lg border-primary">
                      {{ item.answer.text_value }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-col>
</template>
