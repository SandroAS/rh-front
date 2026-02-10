<script setup lang="ts">
import { onMounted, computed } from 'vue'
import EmployeesProgressionChart from '@/components/system/dashboard/EmployeesProgressionChart.vue'
import TeamsProgressionsList from '@/components/system/dashboard/TeamsProgressionsList.vue'
import TopFiveProgressionsList from '@/components/system/dashboard/TopFiveProgressionsList.vue'
import PendingEvaluationsList from '@/components/system/dashboard/PendingEvaluationsList.vue'
import EmployeesCard from '@/components/system/dashboard/EmployeesCard.vue'
import TeamsCard from '@/components/system/dashboard/TeamsCard.vue'
import EvaluationsCard from '@/components/system/dashboard/EvaluationsCard.vue'
</script>

<template>
  <v-container fluid>
    <!-- Totalizadores -->
    <v-row dense class="mb-6">
      <v-col cols="12" md="4">
        <EmployeesCard />
      </v-col>
      <v-col cols="12" md="4">
        <TeamsCard />
      </v-col>
      <v-col cols="12" md="4">
        <EvaluationsCard />
      </v-col>
    </v-row>

    <EmployeesProgressionChart />

    <v-row class="mt-6">
      <!-- <v-col cols="12" lg="4" md="6">
        <TeamsProgressionsList />
      </v-col> -->
      <!-- <v-col cols="12" lg="4" md="6">
        <TopFiveProgressionsList />
      </v-col> -->
      <v-col cols="12" lg="4" md="6">
        <PendingEvaluationsList />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h3 {
  font-weight: 600;
}
</style>
