<script setup lang="ts">
import { ref } from 'vue';
import { useSnackbarStore } from '@/stores/snackbar.store';
import type EvaluationApplication from '@/types/evaluationApplication/evaluation-application.type';
 
const snackbarStore = useSnackbarStore();

// Simulação de dados da aplicação de avaliação
const application = ref<EvaluationApplication>({
  uuid: 'app-mock-001',
  evaluation_uuid: 'model-mock-001',
  type: 'peer',
  requested_by_user_uuid: 'user-001',
  evaluated_collaborator_uuid: 'user-002',
  evaluator_collaborator_uuid: 'user-003',
  application_date: '2025-08-05',
  status: 'pending',
  // Dados do modelo de avaliação aninhado para o formulário
  evaluation: {
    uuid: 'model-mock-001',
    title: 'Avaliação de Desempenho - Analista de DP',
    rate: 5,
    drd_uuid: 'drd-dp-mock',
    created_by_user_uuid: 'user-001',
    evaluation_topics: [
      {
        uuid: '1',
        title: 'Competências Técnicas',
        description: 'Habilidades e conhecimentos específicos da área de Departamento Pessoal.',
        evaluation_questions: [
          {
            uuid: '1',
            title: 'Conhecimento da Legislação Trabalhista (CLT, E-Social, etc.)',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
          {
            uuid: '2',
            title: 'Eficiência nos processos de admissão e demissão.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
          {
            uuid: '3',
            title: 'Domínio de sistemas e ferramentas (ERP, ponto eletrônico).',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
          {
            uuid: '4',
            title: 'Qualidade e precisão no cálculo da folha de pagamento.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
        ],
      },
      {
        uuid: '2',
        title: 'Habilidades Comportamentais',
        description: 'Capacidade de interagir com colegas e resolver problemas.',
        evaluation_questions: [
          {
            uuid: '5',
            title: 'Comunicação clara e objetiva com colaboradores.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
          {
            uuid: '6',
            title: 'Habilidade de trabalhar em equipe e colaborar.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
          {
            uuid: '7',
            title: 'Proatividade na resolução de problemas e melhoria de processos.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
          {
            uuid: '8',
            title: 'Maturidade e profissionalismo ao lidar com informações confidenciais.',
            description: '',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
          },
        ],
      },
    ],
  },
  // Dados mockados dos colaboradores envolvidos
  evaluated_collaborator: { uuid: 'user-002', name: 'Maria Santos', email: 'maria.santos@empresa.com' },
  evaluator_collaborator: { uuid: 'user-003', name: 'Pedro Souza', email: 'pedro.souza@empresa.com' },
});

// Respostas do formulário. Usaremos um objeto para armazenar as respostas de forma dinâmica.
const formAnswers = ref<Record<string, number>>({});

// Lógica para enviar o formulário
function submitEvaluation() {
  console.log('Respostas do formulário:', formAnswers.value);
  // Aqui você enviaria os dados para a API
  snackbarStore.show('Avaliação enviada com sucesso!', 'success');
}
</script>

<template>
  <v-container v-if="application && application.evaluation">
    <v-card class="pa-8">
      <div class="text-h4 font-weight-bold mb-2">{{ application.evaluation.title }}</div>
      <div class="text-subtitle-1 text-medium-emphasis">
        Preencha o formulário de avaliação para o colaborador
        <strong>{{ application.evaluated_collaborator?.name }}</strong>.
      </div>

      <v-divider class="my-6"></v-divider>

      <div v-for="topic in application.evaluation.evaluation_topics" :key="topic.uuid" class="mb-8">
        <div class="text-h5 font-weight-bold">{{ topic.title }}</div>
        <div class="text-subtitle-2 text-medium-emphasis mb-4">{{ topic.description }}</div>

        <div v-for="question in topic.evaluation_questions" :key="question.uuid" class="mb-6">
          <div class="text-subtitle-1">{{ question.title }}</div>
          
          <v-rating
            v-model="formAnswers[question.uuid]"
            color="yellow-darken-3"
            half-increments
            hover
            density="comfortable"
          ></v-rating>
          <div class="text-caption text-medium-emphasis">
            Avaliação: {{ formAnswers[question.uuid] || 'Não avaliado' }} estrelas
          </div>
        </div>
      </div>
      
      <v-btn color="primary" @click="submitEvaluation" class="mt-6" block>
        Enviar Avaliação
      </v-btn>
    </v-card>
  </v-container>

  <v-container v-else>
    <v-alert type="error" variant="tonal">
      Não foi possível carregar o formulário de avaliação.
    </v-alert>
  </v-container>
</template>
