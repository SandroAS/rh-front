<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps<{
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: (number | null)[];
    }[];
  };
  legendPosition?: 'top' | 'bottom';
}>();

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false
    },
    dropShadow: {
      enabled: true,
      color: '#000',
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.1
    },
  },
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  dataLabels: {
    enabled: true,
    background: {
      enabled: true,
      padding: 4,
      borderRadius: 4,
    },
    style: {
      fontSize: '10px',
    },
    formatter: (val: number) => val ? val.toFixed(1) : ''
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  grid: {
    borderColor: '#e7e7e7',
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5
    },
  },
  markers: {
    size: 4,
    hover: {
      size: 6
    }
  },
  xaxis: {
    categories: props.chartData.labels,
    title: {
      show: false
    }
  },
  yaxis: {
    title: {
      text: 'Média da Avaliação',
    },
    min: 0,
    max: 5,
    labels: {
      formatter: (value: number) => value.toFixed(1)
    }
  },
  legend: {
    position: props.legendPosition || 'top',
    horizontalAlign: props.legendPosition === 'bottom' ? 'center' : 'right',
    floating: props.legendPosition === 'top',
    offsetY: props.legendPosition === 'bottom' ? 0 : -25,
    offsetX: props.legendPosition === 'bottom' ? 0 : -5
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => val ? `${val.toFixed(2)} pts` : 'Sem dados'
    }
  }
}));

const series = computed(() => {
  return props.chartData.datasets.map(ds => ({
    name: ds.label,
    data: ds.data
  }));
});
</script>

<template>
  <div class="h-100 w-100">
    <VueApexCharts
      type="line"
      height="350"
      :options="chartOptions"
      :series="series"
    ></VueApexCharts>
  </div>
</template>

<style scoped>
:deep(.apexcharts-canvas) {
  margin: 0 auto;
}
</style>
