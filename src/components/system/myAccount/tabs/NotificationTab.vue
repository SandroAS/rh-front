<script setup lang="ts">
import { reactive } from 'vue';

const notificationSettings = reactive({
  evaluationApplication: {
    system: true,
    email: true,
  },
});

function saveSettings() {
  // TODO: integrar com API de preferências de notificação
  console.log('Salvar preferências:', notificationSettings);
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
        <h6 class="text-subtitle-2 mb-3">Aplicação de avaliações</h6>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Quando você for incluído em uma avaliação (envio, lembrete ou quando houver conclusão), como deseja ser notificado?
        </p>
        <v-row>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.evaluationApplication.system"
              label="Notificar no sistema"
              color="primary"
              hide-details
            />
            <p class="text-caption text-disabled mt-1 ml-8">
              Notificações no sino do sistema quando houver nova aplicação ou atualização.
            </p>
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.evaluationApplication.email"
              label="Notificar por e-mail"
              color="primary"
              hide-details
            />
            <p class="text-caption text-disabled mt-1 ml-8">
              Receber e-mails quando uma avaliação for aplicada ou concluída.
            </p>
          </v-col>
          <v-col cols="12" class="d-flex justify-end mt-4">
            <v-btn type="submit" color="primary">Salvar configurações</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
  </v-row>
</template>
