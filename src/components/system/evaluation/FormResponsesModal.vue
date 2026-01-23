<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type EvaluationMetricResponse from '@/types/evaluationMetrics/evaluation-metric-response.type';
import { formatDate } from '@/utils/formatDate.util';

const props = defineProps<{
  modelValue: boolean;
  formResponses: EvaluationMetricResponse[];
  evaluatedUserName?: string;
  submittingUserName?: string;
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

// Transforma formResponses em uma lista plana de respostas individuais
interface ResponseRow {
  responseUuid: string;
  submittedAt: string;
  isCompleted: boolean;
  questionTitle: string;
  questionDescription?: string;
  questionType: string;
  answerValue: string | number | null;
  answerUuid: string;
}

const allResponseRows = computed((): ResponseRow[] => {
  const rows: ResponseRow[] = [];
  props.formResponses.forEach(response => {
    response.answers?.forEach(answer => {
      rows.push({
        responseUuid: response.uuid,
        submittedAt: response.submitted_at,
        isCompleted: response.is_completed,
        questionTitle: answer.question?.title || 'Sem título',
        questionDescription: answer.question?.description,
        questionType: answer.question?.type || '',
        answerValue: answer.text_value || answer.number_value,
        answerUuid: answer.uuid
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
        String(row.answerValue || '').toLowerCase().includes(search)
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

const getQuestionTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'RATE': 'Nota',
    'SHORT_TEXT': 'Texto Curto',
    'LONG_TEXT': 'Texto Longo',
    'MULTI_CHOICE': 'Múltipla Escolha',
    'SINGLE_CHOICE': 'Escolha Única'
  };
  return types[type] || type;
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="modalValueChanged" max-width="1200px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span class="text-h6">Respostas da Avaliação</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div v-if="props.evaluatedUserName || props.submittingUserName" class="mb-4">
          <v-chip v-if="props.evaluatedUserName" class="mr-2" color="primary" size="small">
            <v-icon start size="small">mdi-account</v-icon>
            Avaliado: {{ props.evaluatedUserName }}
          </v-chip>
          <v-chip v-if="props.submittingUserName" color="secondary" size="small">
            <v-icon start size="small">mdi-account-check</v-icon>
            Avaliador: {{ props.submittingUserName }}
          </v-chip>
        </div>

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
            { title: 'Status', key: 'isCompleted', sortable: true },
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
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2" :color="item.isCompleted ? 'success' : 'warning'">
                {{ item.isCompleted ? 'mdi-check-circle' : 'mdi-clock-outline' }}
              </v-icon>
              {{ formatDate(item.submittedAt) }}
            </div>
          </template>

          <template #item.isCompleted="{ item }">
            <v-chip :color="item.isCompleted ? 'success' : 'warning'" size="small">
              {{ item.isCompleted ? 'Completo' : 'Pendente' }}
            </v-chip>
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
            <v-chip size="small" variant="outlined">
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
