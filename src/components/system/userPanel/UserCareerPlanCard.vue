<script setup lang="ts">
import { ref, computed } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import type { UserPanel } from '@/types/user/user-panel.type';

const props = defineProps<{
  user: UserPanel;
}>();

// Dados mockados para simular o progresso do plano de carreira
const careerProgress = ref({
  drdName: 'Descritivo de Resultado e Desempenho (DRD)',
  currentLevel: 'Desenvolvedor - Nível I',
  indicators: {
    throughput: {
      label: 'Throughput',
      value: 75,
      color: '#4caf50' // verde
    },
    onTimeDelivery: {
      label: 'Assert. de Prazo',
      value: 85,
      color: '#2196f3' // azul
    },
    reworkPercentage: {
      label: 'Retrabalho',
      value: 15,
      color: '#ff5722' // laranja
    }
  },
  checklists: {
    trainings: [
      { name: 'Vue.js Avançado', completed: true },
      { name: 'Testes de Unidade', completed: true },
      { name: 'Git Flow para Equipes', completed: false },
      { name: 'Introdução ao Docker', completed: false }
    ],
    certifications: [
      { name: 'Certificação AWS Solutions Architect', completed: false },
      { name: 'Certificação Azure Developer Associate', completed: false }
    ],
    books: [
      { name: 'Clean Code (Robert C. Martin)', completed: true },
      { name: 'The Pragmatic Programmer', completed: false }
    ]
  }
});

// Opções base para o gráfico de semi-círculo
const baseChartOptions = {
  chart: {
    type: 'radialBar',
    sparkline: {
      enabled: true,
    }
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        size: '60%',
      },
      track: {
        background: '#e7e7e7',
        strokeWidth: '97%',
        margin: 5,
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '14px',
          offsetY: 10,
        },
        value: {
          show: true,
          fontSize: '20px',
          fontWeight: 600,
          offsetY: -25,
        }
      },
    }
  },
  stroke: {
    lineCap: 'round'
  },
  labels: [''],
};

// Configurações e séries para cada gráfico
const throughputChart = computed(() => ({
  series: [careerProgress.value.indicators.throughput.value],
  chartOptions: {
    ...baseChartOptions,
    labels: [careerProgress.value.indicators.throughput.label],
    colors: [careerProgress.value.indicators.throughput.color],
  }
}));

const onTimeDeliveryChart = computed(() => ({
  series: [careerProgress.value.indicators.onTimeDelivery.value],
  chartOptions: {
    ...baseChartOptions,
    labels: [careerProgress.value.indicators.onTimeDelivery.label],
    colors: [careerProgress.value.indicators.onTimeDelivery.color],
  }
}));

const reworkChart = computed(() => ({
  series: [careerProgress.value.indicators.reworkPercentage.value],
  chartOptions: {
    ...baseChartOptions,
    labels: [careerProgress.value.indicators.reworkPercentage.label],
    colors: [careerProgress.value.indicators.reworkPercentage.color],
  }
}));

// Classes dinâmicas para o texto de porcentagem
const getTextColorClass = (value: number) => {
  if (value >= 90) return 'text-success';
  if (value >= 50) return 'text-warning';
  return 'text-primary';
};

const getReworkTextColorClass = (value: number) => {
  if (value <= 10) return 'text-success';
  if (value <= 20) return 'text-warning';
  return 'text-error';
};
</script>

<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-chart-bar</v-icon>
      O que está pendente para alcançar o próximo nível:
    </v-card-title>
    <v-divider class="mb-4"></v-divider>

    <div class="d-flex align-end">
      <div class="text-h6 font-weight-bold mr-2">{{ careerProgress.drdName }}:</div>
      <div class="text-h5 text-primary">{{ careerProgress.currentLevel.split(' - ')[0] }}</div>
    </div>
    <div class="mb-4 d-flex align-end">
      <div class="text-subtitle-1 font-weight-bold mr-2">Nível atual:</div>
      <div class="text-h6 text-primary">{{ careerProgress.currentLevel.split(' - ')[1] }}</div>
    </div>

    <div class="text-h6 font-weight-bold my-4">Indicadores de Desempenho:</div>
    <v-divider class="mb-4"></v-divider>

    <v-row class="text-center">
      <v-col cols="12" md="4">
        <VueApexCharts
          type="radialBar"
          :series="throughputChart.series"
          :options="throughputChart.chartOptions"
        ></VueApexCharts>
      </v-col>
      
      <v-col cols="12" md="4">
        <VueApexCharts
          type="radialBar"
          :series="onTimeDeliveryChart.series"
          :options="onTimeDeliveryChart.chartOptions"
        ></VueApexCharts>
      </v-col>

      <v-col cols="12" md="4">
        <VueApexCharts
          type="radialBar"
          :series="reworkChart.series"
          :options="reworkChart.chartOptions"
        ></VueApexCharts>
      </v-col>
    </v-row>

    <div class="text-h6 font-weight-bold my-4 mt-6">Conquistas e Requisitos:</div>
    <v-divider class="mb-4"></v-divider>

    <v-row>
      <v-col cols="12" md="6">
        <v-list density="compact" rounded>
          <v-list-subheader class="font-weight-bold text-subtitle-1">Treinamentos</v-list-subheader>
          <v-list-item
            v-for="(item, i) in careerProgress.checklists.trainings"
            :key="i"
            :value="item"
          >
            <template #prepend>
              <v-icon
                :color="item.completed ? 'success' : 'grey-lighten-1'"
                :icon="item.completed ? 'mdi-check-circle' : 'mdi-circle-outline'"
              ></v-icon>
            </template>
            <v-list-item-title class="text-wrap" :class="{'text-decoration-line-through': item.completed}">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col cols="12" md="6">
        <v-list density="compact" rounded>
          <v-list-subheader class="font-weight-bold text-subtitle-1">Certificados</v-list-subheader>
          <v-list-item
            v-for="(item, i) in careerProgress.checklists.certifications"
            :key="i"
            :value="item"
          >
            <template #prepend>
              <v-icon
                :color="item.completed ? 'success' : 'grey-lighten-1'"
                :icon="item.completed ? 'mdi-check-circle' : 'mdi-circle-outline'"
              ></v-icon>
            </template>
            <v-list-item-title class="text-wrap" :class="{'text-decoration-line-through': item.completed}">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
        
        <v-list density="compact" rounded class="mt-4">
          <v-list-subheader class="font-weight-bold text-subtitle-1">Livros</v-list-subheader>
          <v-list-item
            v-for="(item, i) in careerProgress.checklists.books"
            :key="i"
            :value="item"
          >
            <template #prepend>
              <v-icon
                :color="item.completed ? 'success' : 'grey-lighten-1'"
                :icon="item.completed ? 'mdi-check-circle' : 'mdi-circle-outline'"
              ></v-icon>
            </template>
            <v-list-item-title class="text-wrap" :class="{'text-decoration-line-through': item.completed}">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
</template>
