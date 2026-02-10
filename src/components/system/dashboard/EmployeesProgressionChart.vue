<script setup lang="ts">
import { onMounted, computed } from 'vue'
import ApexChart from 'vue3-apexcharts'
import { useEvaluationApplicationStore } from '@/stores/evaluation-application.store'

const evaluationApplicationStore = useEvaluationApplicationStore()

// Processa os dados da API para formatar labels e extrair valores
const labels = computed(() => {
  const data = evaluationApplicationStore.evaluations_applications_chart_data
  if (!data || !Array.isArray(data) || data.length === 0) return []
  
  return data.map(item => {
    // Converte "YYYY-MM" para "MMM/AA"
    const [year, month] = item.month.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    const monthShort = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    const yearShort = date.toLocaleDateString('pt-BR', { year: '2-digit' })
    return `${monthShort.replace(monthShort[0], monthShort[0].toUpperCase())}/${yearShort}`
  })
})

const completedEvaluationsCount = computed(() => {
  const data = evaluationApplicationStore.evaluations_applications_chart_data
  if (!data || !Array.isArray(data) || data.length === 0) return []
  return data.map(item => item.completed_evaluations_count)
})

const averageRatePercentage = computed(() => {
  const data = evaluationApplicationStore.evaluations_applications_chart_data
  if (!data || !Array.isArray(data) || data.length === 0) return []
  return data.map(item => item.average_rate_percentage)
})


const series = computed(() => [
  {
    name: 'Avaliações Respondidas',
    type: 'bar',
    data: completedEvaluationsCount.value,
  },
  {
    name: 'Média das Respostas (%)',
    type: 'line',
    data: averageRatePercentage.value,
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    stacked: false,
    toolbar: { show: false },
  },
  xaxis: {
    categories: labels.value,
  },
  yaxis: [
    {
      seriesName: 'Avaliações Respondidas',
      opposite: false,
      min: 0,
      title: {
        text: 'Quantidade de Avaliações',
        style: {
          color: '#4CAF50',
        }
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}`,
        style: {
          colors: '#4CAF50',
        }
      },
    },
    {
      seriesName: 'Média das Respostas (%)',
      opposite: true,
      min: 0,
      max: 100,
      title: {
        text: 'Média das Respostas (%)',
        style: {
          color: '#1976d2',
        }
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: {
          colors: '#1976d2',
        }
      },
    }
  ],
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '50%',
      dataLabels: {
        position: 'top',
      },
    },
  },
  dataLabels: {
    enabled: true,
    enabledOnSeries: [0],
    formatter: (val: number) => `${val.toFixed(0)}`,
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ['#304758'],
    },
  },
  stroke: {
    width: [0, 4],
    curve: 'smooth',
    dashArray: [0, 0]
  },
  colors: ['#4CAF50', '#1976d2'],
  tooltip: {
    shared: true,
    intersect: false,
    y: [
      {
        formatter: (val: number) => `${val.toFixed(0)} avaliações`,
        title: {
          formatter: (seriesName: string) => seriesName,
        },
      },
      {
        formatter: (val: number) => `${val.toFixed(1)}%`,
        title: {
          formatter: (seriesName: string) => seriesName,
        },
      },
    ],
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5
    },
  },
  markers: {
    size: 5,
    colors: ['#1976d2'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: {
      size: 7,
    }
  },
}))

onMounted(async () => {
  await evaluationApplicationStore.getEvaluationsApplicationsChartData()
})
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="2" class="pa-4">
        <h3 class="mb-4">Avaliações Respondidas vs. Média das Respostas</h3>
        <ApexChart
          v-if="evaluationApplicationStore.evaluations_applications_chart_data"
          width="100%"
          height="350"
          :options="chartOptions"
          :series="series"
        />
      </v-card>
    </v-col>
  </v-row>
</template>
