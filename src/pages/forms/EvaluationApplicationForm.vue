<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useSnackbarStore } from '@/stores/snackbar.store';
  import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store';
  import type { EvaluationApplicationForm } from '@/types/evaluationApplication/evaluation-application.type';
  import getApplicationTypeName from '@/utils/getApplicationTypeName.util';
  
  const evaluationApplicationStore = useEvaluationApplicationStore();
  const snackbarStore = useSnackbarStore();
  const route = useRoute();
  
  const loading = ref(true);
  const evaluationApplication = ref<EvaluationApplicationForm | null>(null);
  
  // Respostas do formulário indexadas pelo UUID da questão
  const formAnswers = ref<Record<string, any>>({});
  
  const evaluationApplicationUuid = route.params.uuid as string;
  
  // Atalho para acessar o formulário dentro da aplicação
  const form = computed(() => evaluationApplication.value?.formApplication);
  
  onMounted(async () => {
    try {
      loading.value = true;
      const response = await evaluationApplicationStore.getEvaluationApplication(evaluationApplicationUuid);
      
      if (response) {
        evaluationApplication.value = response;
        
        // Opcional: Pré-inicializar o objeto de respostas para evitar reatividade lenta
        response.formApplication?.topics.forEach(topic => {
          topic.questions.forEach(question => {
            if (question.uuid) {
              // Se for escala ou rádio, inicia nulo ou valor padrão
              formAnswers.value[question.uuid] = null;
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
  
  // Validação simples: verifica se todas as questões obrigatórias foram respondidas
  const isFormValid = computed(() => {
    if (!form.value) return false;
    
    for (const topic of form.value.topics) {
      for (const question of topic.questions) {
        if (question.is_required && !formAnswers.value[question.uuid as string]) {
          return false;
        }
      }
    }
    return true;
  });
  
  async function submitEvaluation() {
    if (!isFormValid.value) {
      snackbarStore.show('Por favor, responda todas as questões obrigatórias.', 'warning');
      return;
    }
  
    try {
      // Aqui você deve adaptar para o método de envio do seu store
      // Exemplo: await evaluationApplicationStore.submitAnswers(evaluationApplicationUuid, formAnswers.value);
      console.log('Enviando respostas:', formAnswers.value);
      
      snackbarStore.show('Avaliação enviada com sucesso!', 'success');
    } catch (error) {
      snackbarStore.show('Erro ao enviar avaliação.', 'error');
    }
  }
  </script>
  
  <template>
    <v-container v-if="loading" class="fill-height d-flex align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-container>
  
    <v-container v-else-if="evaluationApplication && form">
      <v-card class="pa-8 mx-auto" max-width="900" elevation="2">
        <!-- Cabeçalho do Formulário -->
        <div class="mb-6">
          <div class="text-h4 font-weight-bold mb-2">{{ form.name }}</div>
          <div v-if="form.description" class="text-body-1 text-medium-emphasis mb-4">
            {{ form.description }}
          </div>
          
          <v-alert border="start" color="primary" variant="tonal" class="mt-4">
            <div class="text-subtitle-2">
              Avaliado: <strong>{{ evaluationApplication.evaluated_user?.name }}</strong>
            </div>
            <div class="text-caption">
              Tipo de avaliação: {{ getApplicationTypeName(evaluationApplication.type) }}
            </div>
          </v-alert>
        </div>
  
        <v-divider class="my-6"></v-divider>
  
        <!-- Tópicos -->
        <div v-for="topic in form.topics" :key="topic.uuid" class="mb-10">
          <div class="topic-header mb-4">
            <div class="text-h5 font-weight-bold color-primary">{{ topic.title }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ topic.description }}</div>
          </div>
  
          <!-- Questões -->
          <v-card 
            variant="flat" 
            v-for="question in topic.questions" 
            :key="question.uuid" 
            class="mb-6 pa-4 bg-grey-lighten-5 rounded-lg"
          >
            <div class="d-flex align-start mb-2">
              <div class="text-subtitle-1 font-weight-medium">
                {{ question.title }}
                <span v-if="question.is_required" class="text-error">*</span>
              </div>
            </div>
            
            <div v-if="question.description" class="text-caption text-medium-emphasis mb-3">
              {{ question.description }}
            </div>
  
            <!-- Renderização Baseada no Tipo (Exemplo com Scale/Estrelas) -->
            <template v-if="question.type === 'scale' || question.type === 'rating'">
              <v-rating
                v-model="formAnswers[question.uuid!]"
                color="orange-darken-2"
                active-color="orange-darken-2"
                hover
                density="comfortable"
                :length="5"
              ></v-rating>
            </template>
  
            <!-- Exemplo para questões de múltipla escolha (se houver options) -->
            <template v-else-if="question.type === 'multiple_choice' && question.options">
              <v-radio-group v-model="formAnswers[question.uuid!]">
                <v-radio
                  v-for="opt in question.options"
                  :key="opt.uuid"
                  :label="opt.text"
                  :value="opt.uuid"
                ></v-radio>
              </v-radio-group>
            </template>
  
            <!-- Campo de texto livre -->
            <template v-else-if="question.type === 'text'">
              <v-textarea
                v-model="formAnswers[question.uuid!]"
                variant="outlined"
                density="compact"
                placeholder="Sua resposta..."
                rows="3"
                hide-details
              ></v-textarea>
            </template>
          </v-card>
        </div>
        
        <v-divider class="my-6"></v-divider>
  
        <div class="d-flex justify-end gap-4">
          <v-btn variant="text" to="/dashboard">Cancelar</v-btn>
          <v-btn 
            color="primary" 
            size="large" 
            :disabled="!isFormValid"
            @click="submitEvaluation" 
            class="px-8"
          >
            Finalizar Avaliação
          </v-btn>
        </div>
      </v-card>
    </v-container>
  
    <v-container v-else class="fill-height d-flex align-center justify-center">
      <v-alert type="error" variant="tonal" max-width="500">
        <v-alert-title>Formulário não encontrado</v-alert-title>
        Não foi possível carregar os dados desta avaliação. Verifique se o link está correto ou se a avaliação já foi finalizada.
        <template #append>
          <v-btn variant="text" to="/dashboard">Voltar</v-btn>
        </template>
      </v-alert>
    </v-container>
  </template>
  
  <style scoped>
  .color-primary {
    color: rgb(var(--v-theme-primary));
  }
  
  .topic-header {
    border-left: 4px solid rgb(var(--v-theme-primary));
    padding-left: 16px;
  }
  </style>
