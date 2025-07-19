<script setup lang="ts">
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

// Definição da interface para os dados de uma única sprint
interface SprintDataItem {
  name: string; // Nome da sprint (ex: "Sprint Fev/25")

  // CENÁRIOS PARA SPRINTS PASSADAS:
  // Projetos planejados SÓ para esta sprint:
  sprintOnlyOnTime?: number;        // Entregues no prazo (verde)
  sprintOnlyDelayed?: number;       // Entregues fora do prazo (vermelho)
  sprintOnlyNotDelivered?: number;  // Não entregues (vermelho escuro 1)

  // Projetos planejados para MAIS DE UMA sprint:
  multiSprintNotPlannedDelivery?: number; // Não planejados para entrega nesta sprint (amarelo)
  multiSprintPlannedDeliveryDelayed?: number; // Planejados para entrega nesta sprint e entregues fora do prazo (vermelho escuro 2)
  multiSprintPlannedDeliveryOnTime?: number; // Planejados para entrega nesta sprint e entregues no prazo (verde escuro)
  multiSprintPlannedDeliveryNotDelivered?: number; // Planejados para entrega nesta sprint e NÃO entregues (vermelho escuro 3)

  // CENÁRIOS PARA A SPRINT ATUAL:
  currentNewProjects?: number;      // Projetos novos nesta sprint (azul)
  currentInheritedDelayed?: number; // Projetos herdados e já atrasados (laranja)
  currentMultiSprintNotPlannedDelivery?: number; // Projetos multi-sprint não planejados para entrega nesta (amarelo)
}

// Dados mockados de exemplo para o gráfico de sprint
// Estes dados podem vir de uma prop no futuro, se necessário
const mockSprintData: SprintDataItem[] = [
  // Exemplo de sprints passadas
  {
    name: 'Spint 1 (12/05 - 25/05)',
    sprintOnlyOnTime: 5,
    sprintOnlyDelayed: 1,
    sprintOnlyNotDelivered: 0,
    multiSprintNotPlannedDelivery: 2,
    multiSprintPlannedDeliveryDelayed: 1,
    multiSprintPlannedDeliveryOnTime: 3,
    multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 2 (26/05 - 08/06)',
    sprintOnlyOnTime: 7,
    sprintOnlyDelayed: 0,
    sprintOnlyNotDelivered: 1,
    multiSprintNotPlannedDelivery: 1,
    multiSprintPlannedDeliveryDelayed: 0,
    multiSprintPlannedDeliveryOnTime: 2,
    multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 3 (09/06 - 22/06)',
    sprintOnlyOnTime: 4,
    sprintOnlyDelayed: 2,
    sprintOnlyNotDelivered: 0,
    multiSprintNotPlannedDelivery: 2,
    multiSprintPlannedDeliveryDelayed: 1,
    multiSprintPlannedDeliveryOnTime: 1,
    multiSprintPlannedDeliveryNotDelivered: 1,
  },
  {
    name: 'Spint 4 (23/06 - 06/07)',
    sprintOnlyOnTime: 8,
    sprintOnlyDelayed: 0,
    sprintOnlyNotDelivered: 0,
    multiSprintNotPlannedDelivery: 0,
    multiSprintPlannedDeliveryDelayed: 0,
    multiSprintPlannedDeliveryOnTime: 2,
    multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 5 (07/07 - 20/07)',
    sprintOnlyOnTime: 5,
    sprintOnlyDelayed: 3,
    sprintOnlyNotDelivered: 1,
    multiSprintNotPlannedDelivery: 1,
    multiSprintPlannedDeliveryDelayed: 0,
    multiSprintPlannedDeliveryOnTime: 2,
    multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 6 (21/07 - 03/08)',
    sprintOnlyOnTime: 9,
    sprintOnlyDelayed: 1,
    sprintOnlyNotDelivered: 0,
    multiSprintNotPlannedDelivery: 2,
    multiSprintPlannedDeliveryDelayed: 1,
    multiSprintPlannedDeliveryOnTime: 1,
    multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 7 (04/08 - 17/08)',
    sprintOnlyOnTime: 6,
    sprintOnlyDelayed: 2,
    sprintOnlyNotDelivered: 1,
    multiSprintNotPlannedDelivery: 1,
    multiSprintPlannedDeliveryDelayed: 0,
    multiSprintPlannedDeliveryOnTime: 2,
    multiSprintPlannedDeliveryNotDelivered: 0,
  },
  // Sprint atual
  {
    name: 'Sprint Atual (18/07 - 31/07)',
    currentNewProjects: 7,
    currentInheritedDelayed: 3,
    currentMultiSprintNotPlannedDelivery: 2,
  },
];

const chartSeries = computed(() => {
  const series = [
    { name: 'Entregues no Prazo', data: [] as number[], color: '#4CAF50' },
    { name: 'Entregues Fora do Prazo', data: [] as number[], color: '#f27070' },
    { name: 'Não Entregues', data: [] as number[], color: '#E74040' },
    { name: 'Não Prev. Entrega (Passada)', data: [] as number[], color: '#FFEB3B' },
    { name: 'Entrega Prev. Atraso', data: [] as number[], color: '#B71C1C' },
    { name: 'Entrega Prev. Prazo', data: [] as number[], color: '#388E3C' },
    { name: 'Entrega Prev. Não Entregue', data: [] as number[], color: '#890F0F' },
    { name: 'Novos Projetos', data: [] as number[], color: '#2196F3' },
    { name: 'Herdadas Atrasados', data: [] as number[], color: '#FF9800' },
    { name: 'MP Não Prev. Entrega', data: [] as number[], color: '#FFEB3B' },
  ];

  mockSprintData.forEach(sprint => {
    (series[0].data as number[]).push(sprint.sprintOnlyOnTime || 0);
    (series[1].data as number[]).push(sprint.sprintOnlyDelayed || 0);
    (series[2].data as number[]).push(sprint.sprintOnlyNotDelivered || 0);
    (series[3].data as number[]).push(sprint.multiSprintNotPlannedDelivery || 0);
    (series[4].data as number[]).push(sprint.multiSprintPlannedDeliveryDelayed || 0);
    (series[5].data as number[]).push(sprint.multiSprintPlannedDeliveryOnTime || 0);
    (series[6].data as number[]).push(sprint.multiSprintPlannedDeliveryNotDelivered || 0);
    (series[7].data as number[]).push(sprint.currentNewProjects || 0);
    (series[8].data as number[]).push(sprint.currentInheritedDelayed || 0);
    (series[9].data as number[]).push(sprint.currentMultiSprintNotPlannedDelivery || 0);
  });

  return series.filter(s => s.data.some(d => d > 0));
});

const chartCategories = computed(() => mockSprintData.map(sprint => sprint.name));

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 5,
      borderRadiusApplication: 'end', // Aplicar arredondamento na extremidade superior da barra empilhada
      borderRadiusWhenStacked: true,  // Habilitar arredondamento em barras empilhadas
      dataLabels: {
        total: {
          enabled: true,
          formatter: (val: number) => (val ? val.toFixed(0) : ''),
          style: { fontSize: '12px', fontWeight: 700, color: '#333' }
        }
      }
    },
  },
  xaxis: {
    categories: chartCategories.value,
    labels: { style: { fontSize: '12px', fontWeight: 500, colors: '#333' } },
  },
  yaxis: {
    title: {
      text: 'Quantidade de Projetos',
      style: { fontSize: '14px', fontWeight: 600, color: '#555' },
    },
    labels: {
      formatter: (val: number) => val.toFixed(0),
      style: { fontSize: '12px', fontWeight: 500, colors: '#333' },
    },
  },
  fill: { opacity: 1 },
  colors: chartSeries.value.map(s => s.color),
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    markers: { radius: 12 },
    itemMargin: { horizontal: 10, vertical: 5 }
  },
  tooltip: {
    y: {
      formatter: (val: number) => {
        return val.toFixed(0);
      }
    }
  },
  grid: {
    show: true,
    borderColor: '#e0e0e0',
    strokeDashArray: 0,
    position: 'back',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => (val > 0 ? val.toFixed(0) : ''),
    style: { fontSize: '10px', colors: ['#fff'] },
    dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.5 }
  },
}));
</script>

<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="text-h6 font-weight-bold mb-4">Evolução de Entregas por Sprint</v-card-title>
    <v-divider class="mb-4"></v-divider>
    <div id="chart">
      <VueApexCharts
        type="bar"
        :options="chartOptions"
        :series="chartSeries"
        height="350"
      ></VueApexCharts>
    </div>
  </v-card>
</template>
