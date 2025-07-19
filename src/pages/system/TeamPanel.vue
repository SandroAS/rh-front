<script setup lang="ts">
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

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
  currentMultiSprintNotPlannedDelivery?: number; // NOVO: Projetos multi-sprint não planejados para entrega nesta (amarelo)
}

// Dados mockados de exemplo para o gráfico de sprint com os novos cenários
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
    sprintOnlyNotDelivered: 1, // Não entregue
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
    multiSprintPlannedDeliveryNotDelivered: 1, // Multi-sprint, entrega planejada, não entregue
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
    name: 'Sprint Atual (18/07 - 31/07)', // Considerando a data atual de 19/07/2025
    currentNewProjects: 7,
    currentInheritedDelayed: 3,
    currentMultiSprintNotPlannedDelivery: 2, // NOVO: 2 projetos multi-sprint não previstos para entrega nesta sprint atual
  },
];

const chartSeries = computed(() => {
  const series = [
    // Projetos planejados para SÓ esta sprint (passadas)
    { name: 'Entregues no Prazo', data: [] as number[], color: '#4CAF50' }, // Verde
    { name: 'Entregues Fora do Prazo', data: [] as number[], color: '#f27070' }, // Vermelho
    { name: 'Não Entregues', data: [] as number[], color: '#E74040' }, // Vermelho Escuro 1

    // Projetos planejados para MAIS DE UMA sprint (passadas)
    { name: 'Não Prev. Entrega (Passada)', data: [] as number[], color: '#FFEB3B' }, // Amarelo
    { name: 'Entrega Prev. Atraso', data: [] as number[], color: '#B71C1C' }, // Vermelho Escuro 2
    { name: 'Entrega Prev. Prazo', data: [] as number[], color: '#388E3C' }, // Verde Escuro
    { name: 'Entrega Prev. Não Entregue', data: [] as number[], color: '#890F0F' }, // Vermelho Escuro 3

    // Cenários para a Sprint ATUAL
    { name: 'Novos Projetos', data: [] as number[], color: '#2196F3' }, // Azul
    { name: 'Herdadas Atrasados', data: [] as number[], color: '#FF9800' }, // Laranja
    { name: 'Não Prev. Entrega', data: [] as number[], color: '#FFEB3B' }, // Amarelo (mesma cor do passado)
  ];

  mockSprintData.forEach(sprint => {
    // Sprints Passadas
    (series[0].data as number[]).push(sprint.sprintOnlyOnTime || 0);
    (series[1].data as number[]).push(sprint.sprintOnlyDelayed || 0);
    (series[2].data as number[]).push(sprint.sprintOnlyNotDelivered || 0);
    (series[3].data as number[]).push(sprint.multiSprintNotPlannedDelivery || 0);
    (series[4].data as number[]).push(sprint.multiSprintPlannedDeliveryDelayed || 0);
    (series[5].data as number[]).push(sprint.multiSprintPlannedDeliveryOnTime || 0);
    (series[6].data as number[]).push(sprint.multiSprintPlannedDeliveryNotDelivered || 0);

    // Sprint Atual (usamos os novos campos aqui)
    (series[7].data as number[]).push(sprint.currentNewProjects || 0);
    (series[8].data as number[]).push(sprint.currentInheritedDelayed || 0);
    (series[9].data as number[]).push(sprint.currentMultiSprintNotPlannedDelivery || 0);
  });

  // Filtra as séries que não possuem nenhum dado para não aparecerem na legenda ou gráfico desnecessariamente
  return series.filter(s => s.data.some(d => d > 0));
});

const chartCategories = computed(() => mockSprintData.map(sprint => sprint.name));

// Opções do gráfico ApexCharts
const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 5,
      // === NOVO ===
      // Adicionado borderRadiusApplication para garantir que o arredondamento ocorra nas extremidades
      // 'end' arredonda a extremidade superior ou direita (dependendo de horizontal: false/true)
      // 'both' arredonda ambas as extremidades do grupo empilhado (o que geralmente queremos)
      borderRadiusApplication: 'end', // Pode testar 'both' se preferir arredondar também a base
      borderRadiusWhenStacked: true, // Garante que se aplica quando empilhado
      // === FIM NOVO ===
      dataLabels: {
        total: {
          enabled: true,
          formatter: function (val: number) {
            return val ? val.toFixed(0) : '';
          },
          style: {
            fontSize: '12px',
            fontWeight: 700,
            color: '#333'
          }
        }
      }
    },
  },
  xaxis: {
    categories: chartCategories.value,
    labels: {
      style: {
        fontSize: '12px',
        fontWeight: 500,
        colors: '#333',
      },
    },
  },
  yaxis: {
    title: {
      text: 'Quantidade de Projetos',
      style: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#555',
      },
    },
    labels: {
      formatter: function (val: number) {
        return val.toFixed(0);
      },
      style: {
        fontSize: '12px',
        fontWeight: 500,
        colors: '#333',
      },
    },
  },
  fill: {
    opacity: 1,
  },
  colors: chartSeries.value.map(s => s.color),
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    markers: {
      radius: 12,
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5
    }
  },
  tooltip: {
    y: {
      formatter: function (val: number) {
        return val.toFixed(0);
      }
    }
  },
  grid: {
    show: true,
    borderColor: '#e0e0e0',
    strokeDashArray: 0,
    position: 'back',
    xaxis: {
      lines: {
        show: false,
      }
    },
    yaxis: {
      lines: {
        show: true,
      }
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return val > 0 ? val.toFixed(0) : '';
    },
    style: {
      fontSize: '10px',
      colors: ['#fff']
    },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 1,
      opacity: 0.5
    }
  },
}));

</script>

<template>
  <v-container fluid>
    <h2 class="mb-3">Painel do Time: <span style="font-weight: 500;">TechFin</span></h2>

    <v-row>
      <v-col cols="12">
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
      </v-col>
    </v-row>
  </v-container>
</template>
