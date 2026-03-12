<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useNotificationSettingStore } from '@/stores/notification-setting.store';
import { useSnackbarStore } from '@/stores/snackbar.store';

const notificationSettingStore = useNotificationSettingStore();
const snackbarStore = useSnackbarStore();

const system = ref(true);
const email = ref(true);

function syncFromStore() {
  system.value = notificationSettingStore.evaluationApplicationSystem;
  email.value = notificationSettingStore.evaluationApplicationEmail;
}

onMounted(async () => {
  try {
    await notificationSettingStore.fetchNotificationSettings();
    syncFromStore();
  } catch {
    syncFromStore();
  }
});

watch(
  () => notificationSettingStore.settings,
  () => syncFromStore(),
  { deep: true }
);

async function saveSettings() {
  try {
    await notificationSettingStore.saveEvaluationApplicationSettings(system.value, email.value);
    snackbarStore.show('Configurações de notificação salvas.', 'success');
  } catch {
    snackbarStore.show(
      notificationSettingStore.error ?? 'Não foi possível salvar as configurações.',
      'error'
    );
  }
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="4" class="pr-md-6">
      <h5 class="text-subtitle-1 font-weight-medium">Notificações</h5>
      <p class="text-body-2 text-medium-emphasis">
        Escolha como deseja ser avisado sobre aplicações de avaliações de desempenho (envio, lembrete ou conclusão).
      </p>
    </v-col>

    <v-col cols="12" md="8">
      <v-form @submit.prevent="saveSettings">
        <v-progress-linear
          v-if="notificationSettingStore.loading"
          indeterminate
          color="primary"
          class="mb-4"
        />

        <h6 class="text-subtitle-2 mb-3">Aplicação de avaliações</h6>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Quando for enviada uma avaliação para ser respondida por você, como deseja ser notificado?
        </p>
        <v-row>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="system"
              label="Notificar no sistema"
              color="primary"
              hide-details
              :disabled="notificationSettingStore.loading"
            />
            <p class="text-caption text-disabled mt-1 ml-8">
              Notificações no sino do sistema quando houver nova aplicação ou atualização.
            </p>
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="email"
              label="Notificar por e-mail"
              color="primary"
              hide-details
              :disabled="notificationSettingStore.loading"
            />
            <p class="text-caption text-disabled mt-1 ml-8">
              Receber e-mails quando uma avaliação for aplicada ou concluída.
            </p>
          </v-col>
          <v-col cols="12" class="d-flex justify-end mt-4">
            <v-btn
              type="submit"
              color="primary"
              :loading="notificationSettingStore.loading"
              :disabled="notificationSettingStore.loading"
            >
              Salvar configurações
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
  </v-row>
</template>
