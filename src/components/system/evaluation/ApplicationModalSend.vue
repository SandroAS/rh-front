<script setup lang="ts">
import { useEvaluationApplicationStore } from '@/stores/evaluation.application.store';
import { EvaluationApplicationStatus, type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { ref } from 'vue';

const evaluationApplicationStore = useEvaluationApplicationStore();
const snackbarStore = useSnackbarStore();

const props = defineProps<{
  modelValue: boolean;
  selectedApplication?: EvaluationApplication | null;
}>();
const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
};

const forEmail = ref(true);
const forSystem = ref(true);

async function sendApplication() {
  if(!props.selectedApplication?.uuid) return;
  try {
    await evaluationApplicationStore.sendEvaluationApplication(props.selectedApplication.uuid, forEmail.value, forSystem.value);
    snackbarStore.show('Aplicação de avaliação enviada com sucesso.', 'success');
    close();
  } catch (error) {
    console.error(error);
    snackbarStore.show('Erro ao enviar aplicação de avaliação.', 'error');
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500">
    <v-card>
      <v-card-title class="text-h6">
        Enviar Aplicação de Avaliação
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" class="pb-0 d-flex justify-center">
              <v-icon color="warning" size="48">
                mdi-alert
              </v-icon>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              Certeza que deseja enviar a aplicação de avaliação?
              <template v-if="selectedApplication?.status === EvaluationApplicationStatus.SENDED">
                <span class="text-primary">A aplicação já foi enviada, seria um reenvio.</span>
              </template>
              <template v-else-if="selectedApplication?.status === EvaluationApplicationStatus.CREATED">
                A aplicação já esta agendada para ser enviada no dia {{ new Date(selectedApplication?.started_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}.
              </template>
            </v-col>
            <v-col cols="12" class="pb-0 d-flex justify-start">
              <v-switch
                v-model="forEmail"
                color="primary"
                label="Enviar por notificação no e-mail"
                hide-details
              ></v-switch>
            </v-col>
            <v-col cols="12" class="py-0 d-flex justify-start">
              <v-switch
                v-model="forSystem"
                color="primary"
                label="Enviar por notificação no sistema"
                hide-details
              ></v-switch>
            </v-col>
          </v-row>

        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Não</v-btn>
        <v-btn color="primary" @click="sendApplication" :disabled="!forEmail && !forSystem">
          Sim, enviar aplicação
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  