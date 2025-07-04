<script setup lang="ts">
import ApexChart from 'vue3-apexcharts'

// Simulação de dados para os últimos 30 dias
const today = new Date()
const labels = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(today)
  date.setDate(today.getDate() - (29 - i))
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
})

const values = Array.from({ length: 30 }, () => Math.floor(Math.random() * 2000) + 300)

const series = [
  {
    name: 'Faturamento',
    data: values,
  },
]

const chartOptions = {
  chart: {
    type: 'bar',
    toolbar: { show: false },
  },
  xaxis: {
    categories: labels,
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '50%',
      dataLabels: {
        position: 'top', // posição acima da barra
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `R$ ${val.toLocaleString()}`,
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ['#000'],
    },
  },
  colors: ['#1976d2'],
  tooltip: {
    y: {
      formatter: (val: number) => `R$ ${val.toLocaleString()}`,
    },
  },
}
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="2" class="pa-4">
        <h3 class="mb-4">Faturamento - Últimos 30 dias</h3>
        <ApexChart
          width="100%"
          height="350"
          type="bar"
          :options="chartOptions"
          :series="series"
        />
      </v-card>
    </v-col>
  </v-row>
</template>