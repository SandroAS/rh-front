<script setup lang="ts">
import EmployeesProgressionChart from '@/components/system/dashboard/EmployeesProgressionChart.vue'
import BillingPerServiceList from '@/components/system/dashboard/BillingPerServiceList.vue'
import PatientsBirthdayList from '@/components/system/dashboard/PatientsBirthdayList.vue'
import PatientsPendingPaymentList from '@/components/system/dashboard/PatientsPendingPaymentList.vue'

const totalEmployees = 124
const totalTeams = 11
const totalEvaluations = 352
const totalProgression = 250.75
</script>

<template>
  <v-container fluid>
    <!-- Totalizadores -->
    <v-row dense class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="primary">mdi-account</v-icon>
          <div class="text-h6 mt-2">Colaboradores</div>
          <div class="text-h5 font-weight-bold">{{ totalEmployees }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="primary">mdi-account-group</v-icon>
          <div class="text-h6 mt-2">Times</div>
          <div class="text-h5 font-weight-bold">{{ totalTeams }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="primary">mdi-file-document-outline</v-icon>
          <div class="text-h6 mt-2">Avaliações</div>
          <div class="text-h5 font-weight-bold">{{ totalEvaluations }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="primary">mdi-finance</v-icon>
          <div class="text-h6 mt-2">Progressão de Carreira</div>
          <div class="text-h5 font-weight-bold">{{ totalProgression }} %</div>
        </v-card>
      </v-col>
    </v-row>

    <EmployeesProgressionChart />

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
