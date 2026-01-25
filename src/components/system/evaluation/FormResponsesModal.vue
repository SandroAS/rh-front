<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type EvaluationMetricApplication from '@/types/evaluationMetrics/evaluation-metric-application.type';
import { formatDate } from '@/utils/formatDate.util';
import { getInitials } from '@/utils/getInitialsFromName.util';
import { getQuestionTypeLabel, getQuestionTypeIcon } from '@/utils/questionType.util';

const props = defineProps<{
  modelValue: boolean;
  applications: EvaluationMetricApplication[];
}>();

const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
};

function modalValueChanged(value: boolean) {
  emit('update:modelValue', value);
}

// Paginação local
const currentPage = ref(1);
const itemsPerPage = ref(10);
const searchTerm = ref('');

// Transforma as aplicações em uma lista plana de respostas individuais
interface ResponseRow {
  responseUuid: string;
  submittedAt: string;
  questionTitle: string;
  questionDescription?: string;
  questionType: string;
  answerValue: string | number | null;
  answerUuid: string;
  evaluatedUserName: string;
  evaluatedUserEmail: string;
  submittingUserName: string;
  submittingUserEmail: string;
}

const allResponseRows = computed((): ResponseRow[] => {
  const rows: ResponseRow[] = [];
  props.applications.forEach(application => {
    application.formResponses?.forEach(response => {
      response.answers?.forEach(answer => {
        rows.push({
          responseUuid: response.uuid,
          submittedAt: response.submitted_at,
          questionTitle: answer.question?.title || 'Sem título',
          questionDescription: answer.question?.description,
          questionType: answer.question?.type || '',
          answerValue: answer.text_value || answer.number_value,
          answerUuid: answer.uuid,
          evaluatedUserName: application.evaluated_user?.name || '-',
          evaluatedUserEmail: application.evaluated_user?.email || '',
          submittingUserName: application.submitting_user?.name || '-',
          submittingUserEmail: application.submitting_user?.email || ''
        });
      });
    });
  });
  return rows;
});

// Computed para filtrar e paginar as respostas
const filteredResponses = computed(() => {
  let filtered = [...allResponseRows.value];

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(row => {
      return (
        formatDate(row.submittedAt).toLowerCase().includes(search) ||
        row.questionTitle.toLowerCase().includes(search) ||
        row.questionDescription?.toLowerCase().includes(search) ||
        String(row.answerValue || '').toLowerCase().includes(search) ||
        row.evaluatedUserName.toLowerCase().includes(search) ||
        row.evaluatedUserEmail.toLowerCase().includes(search) ||
        row.submittingUserName.toLowerCase().includes(search) ||
        row.submittingUserEmail.toLowerCase().includes(search)
      );
    });
  }

  return filtered;
});

const paginatedResponses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredResponses.value.slice(start, end);
});

const totalItems = computed(() => filteredResponses.value.length);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Resetar página quando o termo de busca mudar
watch(searchTerm, () => {
  currentPage.value = 1;
});

// Resetar quando o modal abrir
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    currentPage.value = 1;
    searchTerm.value = '';
  }
});

</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="modalValueChanged" max-width="1400px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span class="text-h6">Respostas da Avaliação</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="flex-column flex-md-row d-flex justify-space-between mb-4 align-center">
          <v-text-field
            v-model="searchTerm"
            label="Buscar respostas"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            density="compact"
            hide-details
            clearable
            class="mb-4 mb-md-0 w-md-auto w-100"
            style="max-width: 300px;"
          ></v-text-field>

          <div class="text-caption text-medium-emphasis">
            Total: {{ totalItems }} resposta{{ totalItems !== 1 ? 's' : '' }}
          </div>
        </div>

        <v-data-table-server
          :headers="[
            { title: 'Data de Submissão', key: 'submittedAt', sortable: true },
            { title: 'Avaliado', key: 'evaluatedUserName', sortable: true },
            { title: 'Avaliador', key: 'submittingUserName', sortable: true },
            { title: 'Pergunta', key: 'questionTitle', sortable: false },
            { title: 'Resposta', key: 'answerValue', sortable: false },
            { title: 'Tipo', key: 'questionType', sortable: false }
          ]"
          :items="paginatedResponses"
          item-value="answerUuid"
          :items-per-page="itemsPerPage"
          :items-per-page-options="[{title: '10', value: 10}, {title: '25', value: 25}, {title: '50', value: 50}, {title: '100', value: 100}]"
          :items-length="totalItems"
          :loading="false"
          :page="currentPage"
          mobile-breakpoint="md"
          @update:options="({ page, itemsPerPage: itemsPerPageParam }) => {
            currentPage = page;
            itemsPerPage = itemsPerPageParam;
          }"
        >
          <template #item.submittedAt="{ item }">
            {{ formatDate(item.submittedAt) }}
          </template>

          <template #item.evaluatedUserName="{ item }">
            <div class="d-flex align-center gap-3 flex-row-reverse flex-md-row">
              <v-avatar color="primary" size="36" class="mr-2 ml-sm-2 mr-sm-0">
                {{ getInitials(item.evaluatedUserName) }}
              </v-avatar>
              <div class="text-md-left text-right text-left">
                <div class="font-weight-medium">{{ item.evaluatedUserName }}</div>
                <div v-if="item.evaluatedUserEmail" class="text-caption text-medium-emphasis">{{ item.evaluatedUserEmail }}</div>
              </div>
            </div>
          </template>

          <template #item.submittingUserName="{ item }">
            <div class="d-flex align-center gap-3 flex-row-reverse flex-md-row">
              <v-avatar color="secondary" size="36" class="mr-2 ml-sm-2 mr-sm-0">
                {{ getInitials(item.submittingUserName) }}
              </v-avatar>
              <div class="text-md-left text-right text-left">
                <div class="font-weight-medium">{{ item.submittingUserName }}</div>
                <div v-if="item.submittingUserEmail" class="text-caption text-medium-emphasis">{{ item.submittingUserEmail }}</div>
              </div>
            </div>
          </template>

          <template #item.questionTitle="{ item }">
            <div class="d-flex flex-column">
              <div class="font-weight-medium text-body-2">{{ item.questionTitle }}</div>
              <div v-if="item.questionDescription" class="text-caption text-medium-emphasis mt-1">
                {{ item.questionDescription }}
              </div>
            </div>
          </template>

          <template #item.answerValue="{ item }">
            <div class="text-body-2">
              <v-chip v-if="item.questionType === 'RATE' && item.answerValue !== null" 
                color="primary" size="small">
                {{ item.answerValue }}
              </v-chip>
              <span v-else class="text-wrap">{{ item.answerValue || '-' }}</span>
            </div>
          </template>

          <template #item.questionType="{ item }">
            <v-chip size="small" variant="outlined" class="d-flex align-center" style="width: fit-content;">
              <v-icon :icon="getQuestionTypeIcon(item.questionType)" size="small" class="mr-1"></v-icon>
              {{ getQuestionTypeLabel(item.questionType) }}
            </v-chip>
          </template>
        </v-data-table-server>

        <div v-if="totalItems === 0" class="text-center py-8">
          <v-alert type="info" variant="tonal">
            Nenhuma resposta encontrada.
          </v-alert>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
