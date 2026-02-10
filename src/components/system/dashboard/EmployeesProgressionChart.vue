<script setup lang="ts">
import ApexChart from 'vue3-apexcharts'

// --- ESTRUTURA DE DADOS ESPERADA DA API ---
// A API deve retornar um array de objetos com a seguinte estrutura:
// [
//   {
//     month: "2024-01", // Formato YYYY-MM
//     completed_evaluations_count: 45, // Quantidade de avaliações respondidas no mês
//     average_rate_percentage: 78.5 // Porcentagem média do rate das avaliações (0-100)
//   },
//   {
//     month: "2024-02",
//     completed_evaluations_count: 52,
//     average_rate_percentage: 82.3
//   },
//   // ... mais meses
// ]

// --- DADOS MOCKADOS ---
const today = new Date()
// Vamos considerar os últimos 12 meses para uma visão mais ampla
const numMonths = 12; // Exibe os últimos 12 meses
const labels = Array.from({ length: numMonths }, (_, i) => {
  const date = new Date(today.getFullYear(), today.getMonth() - (numMonths - 1 - i), 1)
  // Formato "MMM/AA"
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''); // Ex: "ago", "set"
  const year = date.toLocaleDateString('pt-BR', { year: '2-digit' }); // Ex: "24", "25"
  return `${month.replace(month[0], month[0].toUpperCase())}/${year}`;
})

// Dados para Quantidade de Avaliações Respondidas (Barras)
const completedEvaluationsCount = Array.from({ length: numMonths }, (_, i) => {
  const baseCount = 30 + (i * 2); // Tendência de crescimento gradual
  const randomFactor = Math.floor(Math.random() * 15) - 5; // Variação de -5 a +9
  let count = baseCount + randomFactor;
  count = Math.max(0, count); // Não pode ser negativo
  return Math.floor(count);
});

// Dados para Porcentagem Média do Rate (Linha)
const averageRatePercentage = Array.from({ length: numMonths }, (_, i) => {
  const basePercentage = 65 + (i * 1.5); // Tendência de crescimento gradual
  const randomFactor = Math.random() * 8 - 4; // Variação de -4 a +4
  let percentage = basePercentage + randomFactor;
  percentage = Math.max(0, Math.min(100, percentage)); // Entre 0 e 100
  return parseFloat(percentage.toFixed(1));
});


const series = [
  {
    name: 'Avaliações Respondidas',
    type: 'bar',
    data: completedEvaluationsCount,
  },
  {
    name: 'Média das Respóstass (%)',
    type: 'line',
    data: averageRatePercentage,
  },
]

const chartOptions = {
  chart: {
    type: 'line',
    stacked: false,
    toolbar: { show: false },
  },
  xaxis: {
    categories: labels,
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
      seriesName: 'Média das Respóstass (%)',
      opposite: true,
      min: 0,
      max: 100,
      title: {
        text: 'Média das Respóstass (%)',
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
}
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="2" class="pa-4">
        <h3 class="mb-4">Avaliações Respondidas vs. Média das Respóstas</h3>
        <ApexChart
          width="100%"
          height="350"
          :options="chartOptions"
          :series="series"
        />
      </v-card>
    </v-col>
  </v-row>
</template>
