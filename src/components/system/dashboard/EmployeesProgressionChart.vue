<script setup lang="ts">
import ApexChart from 'vue3-apexcharts'

// --- DADOS MOCKADOS PARA EVOLUÇÃO PERCENTUAL E QUANTIDADE DE PESSOAS ---
const today = new Date()
// Vamos considerar os últimos 12 meses para uma visão mais ampla
const numMonths = 12; // Exibe os últimos 12 meses
const labels = Array.from({ length: numMonths }, (_, i) => {
  const date = new Date(today.getFullYear(), today.getMonth() - (numMonths - 1 - i), 1)
  // --- ALTERAÇÃO AQUI: PARA FORMATAR "MMM/AA" ---
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''); // Ex: "ago", "set"
  const year = date.toLocaleDateString('pt-BR', { year: '2-digit' }); // Ex: "24", "25"
  return `${month.replace(month[0], month[0].toUpperCase())}/${year}`;
})

// Dados para Evolução Percentual Média (Barras)
const careerEvolutionValues = Array.from({ length: numMonths }, (_, i) => {
  const basePercentage = 40 + (i * 3); // Tendência de crescimento gradual
  const randomFactor = Math.floor(Math.random() * 10) - 5; // Variação de -5 a +4
  let percentage = basePercentage + randomFactor;
  percentage = Math.max(0, Math.min(100, percentage));
  return parseFloat(percentage.toFixed(1));
});

// Dados para Quantidade Acumulativa de Pessoas (Linha)
let initialPeopleCount = 100; // Ponto de partida
const peopleCountValues = Array.from({ length: numMonths }, (_, i) => {
  if (i === 0) {
    return initialPeopleCount;
  }
  const netChange = Math.floor(Math.random() * 15) - 5; // Varia entre -5 e +9 pessoas por mês
  initialPeopleCount = Math.max(80, initialPeopleCount + netChange);
  return initialPeopleCount;
});


const series = [
  {
    name: 'Evolução Média (%)',
    type: 'bar',
    data: careerEvolutionValues,
  },
  {
    name: 'Total de Pessoas',
    type: 'line',
    data: peopleCountValues,
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
      seriesName: 'Evolução Média (%)',
      opposite: false,
      min: 0,
      max: 100,
      title: {
        text: 'Evolução Percentual Média (%)',
        style: {
          color: '#4CAF50',
        }
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: {
          colors: '#4CAF50',
        }
      },
    },
    {
      seriesName: 'Total de Pessoas',
      opposite: true,
      title: {
        text: 'Total de Pessoas',
        style: {
          color: '#1976d2',
        }
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}`,
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
    formatter: (val: number) => `${val.toFixed(0)}%`,
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
        formatter: (val: number) => `${val.toFixed(1)}%`,
        title: {
          formatter: (seriesName: string) => seriesName,
        },
      },
      {
        formatter: (val: number) => `${val.toFixed(0)} pessoas`,
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
        <h3 class="mb-4">Evolução de Carreira vs. Pessoas na Empresa</h3>
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
