<script setup lang="ts">
import { useEvaluationApplicationStore } from '@/stores/evaluation.application.store';
import { type EvaluationApplication } from '@/types/evaluationApplication/evaluation-application.type';
import { useSnackbarStore } from '@/stores/snackbar.store';

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

async function cancelApplication() {
  if(!props.selectedApplication?.uuid) return;
  try {
    await evaluationApplicationStore.cancelEvaluationApplication(props.selectedApplication.uuid);
    close();
    snackbarStore.show('Aplicação de avaliação cancelada com sucesso.', 'success');
  } catch (error) {
    console.error(error);
    snackbarStore.show('Erro ao cancelar aplicação de avaliação.', 'error');
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500">
    <v-card>
      <v-card-title class="text-h6">
        Cancelar Aplicação de Avaliação
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
              Certeza que deseja cancelar a aplicação de avaliação? Essa ação não poderá ser desfeita.
            </v-col>
          </v-row>

        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Não</v-btn>
        <v-btn color="error" @click="cancelApplication">
          Sim, cancelar aplicação
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  