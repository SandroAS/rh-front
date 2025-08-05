<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps<{
  chartData: {
    labels: string[];
    datasets: {
      name: string;
      data: number[];
    }[];
  };
}>();

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    stacked: true, // Aqui definimos o gráfico como empilhado
    toolbar: {
      show: true
    },
    zoom: {
      enabled: false
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      legend: {
        position: 'bottom',
        offsetX: -10,
        offsetY: 0
      }
    }
  }],
  xaxis: {
    categories: props.chartData.labels, // Eixo X com os meses
  },
  yaxis: {
    title: {
      text: 'Quantidade de Avaliações',
    },
    labels: {
      formatter: (value: number) => Math.round(value)
    }
  },
  fill: {
    opacity: 1
  },
  colors: ['#4CAF50', '#FFC107', '#F44336'], // Cores para Respondidas, Pendentes, Expiradas
  legend: {
    position: 'right',
    offsetY: 40
  },
  dataLabels: {
    enabled: false
  },
  plotOptions: {
    bar: {
      horizontal: false,
    },
  },
}));

// O `series` do ApexCharts é o `datasets` do seu objeto `chartData`
const series = computed(() => props.chartData.datasets);

</script>

<template>
  <div class="h-100 w-100">
    <VueApexCharts
      type="bar"
      height="400"
      :options="chartOptions"
      :series="series"
    ></VueApexCharts>
  </div>
</template>
