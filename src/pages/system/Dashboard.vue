<script setup lang="ts">
import BillingChart from '@/components/system/dashboard/BillingChart.vue'
import BillingPerServiceList from '@/components/system/dashboard/BillingPerServiceList.vue'
import PatientsBirthdayList from '@/components/system/dashboard/PatientsBirthdayList.vue'
import PatientsPendingPaymentList from '@/components/system/dashboard/PatientsPendingPaymentList.vue'

const totalPacientes = 124
const totalOrcamentos = 89
const totalAtendimentos = 152
const totalFaturamento = 38250.75
// import { useSnackbarStore } from '@/stores/snackbar.store'

// function teste () {
//   const snackbar = useSnackbarStore()
//   snackbar.show('Usuário salvo com sucesso!', 'success')
// }
// function teste2 () {
//   const snackbar = useSnackbarStore()
//   snackbar.show('Usuário salvo com sucesso!', 'warning')
// }
</script>

<template>
  <v-container fluid>
    <!-- <v-btn @click="teste()">
      teste
    </v-btn>
    <v-btn @click="teste2()">
      teste2
    </v-btn> -->
    <!-- Totalizadores -->
    <v-row dense class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="primary">mdi-account</v-icon>
          <div class="text-h6 mt-2">Pacientes</div>
          <div class="text-h5 font-weight-bold">{{ totalPacientes }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="primary">mdi-file-document-outline</v-icon>
          <div class="text-h6 mt-2">Orçamentos</div>
          <div class="text-h5 font-weight-bold">{{ totalOrcamentos }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="primary">mdi-account-heart</v-icon>
          <div class="text-h6 mt-2">Atendimentos</div>
          <div class="text-h5 font-weight-bold">{{ totalAtendimentos }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 bg-primary text-white" elevation="2">
          <v-icon size="32" color="white">mdi-cash-multiple</v-icon>
          <div class="text-h6 mt-2">Faturamento</div>
          <div class="text-h5 font-weight-bold">R$ {{ totalFaturamento.toLocaleString() }}</div>
        </v-card>
      </v-col>
    </v-row>

    <BillingChart />

    <v-row class="mt-6">
      <v-col cols="12" lg="4" md="6">
        <BillingPerServiceList />
      </v-col>
      <v-col cols="12" lg="4" md="6">
        <PatientsBirthdayList />
      </v-col>
      <v-col cols="12" lg="4" md="6">
        <PatientsPendingPaymentList />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h3 {
  font-weight: 600;
}
</style>
