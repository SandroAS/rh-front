<script setup lang="ts">
import { reactive } from 'vue'

const notificationSettings = reactive({
  appointmentReminder: {
    userEmail: {
      enabled: false,
      time: '30'
    },
    userSystem: {
      enabled: false,
      time: '30'
    },
    patientEmail: {
      enabled: false,
      time: '30'
    },
    userWhatsapp: {
      enabled: false
    },
    patientWhatsapp: {
      enabled: false
    }
  },
  paymentDelay: {
    userEmail: false,
    userSystem: false,
    patientEmail: false,
    userWhatsapp: false,
    patientWhatsapp: false
  },
  birthdayReminder: {
    userEmail: false,
    userSystem: false,
    userWhatsapp: false
  },
  scheduleConflict: {
    userEmail: false,
    userSystem: false,
    userWhatsapp: false
  }
})

const reminderTimes = [
  { title: '1 hora antes', value: '60' },
  { title: '30 minutos antes', value: '30' },
  { title: '15 minutos antes', value: '15' },
  { title: '10 minutos antes', value: '10' }
]
</script>

<template>
  <v-row>
    <v-col cols="12" md="4" class="pr-md-6">
      <h5 class="text-subtitle-1 font-weight-medium">Notificações</h5>
      <p class="text-body-2 text-medium-emphasis">
        Configure como você deseja ser notificado, ou notificar seu paciente.
      </p>
    </v-col>

    <v-col cols="12" md="8">
      <v-form>

        <!-- AGENDAMENTO PRÓXIMO -->
        <h6 class="text-subtitle-2 mb-2">Agendamento Próximo</h6>

        <v-row>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.appointmentReminder.userEmail.enabled"
              label="Notificar por e-mail (usuário)"
              color="primary"
            />
            <v-select
              v-model="notificationSettings.appointmentReminder.userEmail.time"
              :items="reminderTimes"
              label="Tempo antes"
              density="compact"
              variant="solo-filled"
              class="mt-n4"
              :disabled="!notificationSettings.appointmentReminder.userEmail.enabled"
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.appointmentReminder.userSystem.enabled"
              label="Notificar no sistema (usuário)"
              color="primary"
            />
            <v-select
              v-model="notificationSettings.appointmentReminder.userSystem.time"
              :items="reminderTimes"
              label="Tempo antes"
              density="compact"
              variant="solo-filled"
              class="mt-n4"
              :disabled="!notificationSettings.appointmentReminder.userSystem.enabled"
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.appointmentReminder.patientEmail.enabled"
              label="Notificar por e-mail (paciente)"
              color="primary"
            />
            <v-select
              v-model="notificationSettings.appointmentReminder.patientEmail.time"
              :items="reminderTimes"
              label="Tempo antes"
              density="compact"
              variant="solo-filled"
              class="mt-n4"
              :disabled="!notificationSettings.appointmentReminder.patientEmail.enabled"
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.appointmentReminder.userWhatsapp.enabled"
              label="WhatsApp (usuário) – Em breve"
              disabled
              color="primary"
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.appointmentReminder.patientWhatsapp.enabled"
              label="WhatsApp (paciente) – Em breve"
              disabled
              color="primary"
              hide-details
            />
          </v-col>
        </v-row>

        <!-- PAGAMENTO EM ATRASO -->
        <h6 class="text-subtitle-2 mt-6 mb-2">Pagamento em Atraso - <small> Uma vez por dia a partir da data de atraso.</small></h6>
        <v-row>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.paymentDelay.userEmail"
              label="Notificar por e-mail (usuário)"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.paymentDelay.userSystem"
              label="Notificar no sistema (usuário)"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.paymentDelay.patientEmail"
              label="Notificar por e-mail (paciente)"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.paymentDelay.userWhatsapp"
              label="WhatsApp (usuário) – Em breve"
              disabled
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.paymentDelay.patientWhatsapp"
              label="WhatsApp (paciente) – Em breve"
              disabled
              color="primary"
              hide-details
            />
          </v-col>
        </v-row>

        <!-- ANIVERSÁRIO DE PACIENTE -->
        <h6 class="text-subtitle-2 mt-6 mb-2">Aniversário de Paciente - <small> No dia do aniversário.</small></h6>
        <v-row>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.birthdayReminder.userEmail"
              label="Notificar por e-mail (usuário)"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.birthdayReminder.userSystem"
              label="Notificar no sistema (usuário)"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.birthdayReminder.userWhatsapp"
              label="WhatsApp (usuário) – Em breve"
              disabled
              color="primary"
              hide-details
            />
          </v-col>
        </v-row>

        <!-- CONFLITO DE AGENDA -->
        <h6 class="text-subtitle-2 mt-6 mb-2">Conflito de Agenda</h6>
        <v-row>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.scheduleConflict.userEmail"
              label="Notificar por e-mail (usuário)"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.scheduleConflict.userSystem"
              label="Notificar no sistema (usuário)"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="notificationSettings.scheduleConflict.userWhatsapp"
              label="WhatsApp (usuário) – Em breve"
              disabled
              color="primary"
              hide-details
            />
          </v-col>

          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="primary" class="mt-4">Salvar Configurações</v-btn>
          </v-col>
        </v-row>

      </v-form>
    </v-col>
  </v-row>
</template>
