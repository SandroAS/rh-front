<script setup lang="ts">
import SprintEvolutionChart from '@/components/system/teamPanel/SprintEvolutionChart.vue';
import { ref, computed } from 'vue';

// Para os totalizadores, vamos precisar de dados de contexto.
// Para fins de demonstração, vou incluir uma versão simplificada do mockSprintData aqui
// para que os cálculos dos totalizadores sejam baseados nela.
// Em um cenário real, esses dados viriam de uma API ou de um Vuex store.

// **Importante:** Se o SprintEvolutionChart precisar dos mesmos dados,
// você precisará decidir onde residem os "dados verdadeiros" e passá-los como prop.
// Por enquanto, para este exemplo, vou duplicar a interface e uma versão reduzida dos dados
// para focar nos cálculos dos totalizadores.
interface SprintDataItemForCalculations {
  name: string;
  sprintOnlyOnTime?: number;
  sprintOnlyDelayed?: number;
  sprintOnlyNotDelivered?: number;
  multiSprintPlannedDeliveryDelayed?: number;
  multiSprintPlannedDeliveryOnTime?: number;
  multiSprintPlannedDeliveryNotDelivered?: number;
  currentNewProjects?: number;
  currentInheritedDelayed?: number;
  currentMultiSprintNotPlannedDelivery?: number;
}

// Usando os dados mockados para os cálculos dos totalizadores
const mockDataForTotalizers: SprintDataItemForCalculations[] = [
  {
    name: 'Spint 1', sprintOnlyOnTime: 5, sprintOnlyDelayed: 1, sprintOnlyNotDelivered: 0,
    multiSprintPlannedDeliveryDelayed: 1, multiSprintPlannedDeliveryOnTime: 3, multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 2', sprintOnlyOnTime: 7, sprintOnlyDelayed: 0, sprintOnlyNotDelivered: 1,
    multiSprintPlannedDeliveryDelayed: 0, multiSprintPlannedDeliveryOnTime: 2, multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 3', sprintOnlyOnTime: 4, sprintOnlyDelayed: 2, sprintOnlyNotDelivered: 0,
    multiSprintPlannedDeliveryDelayed: 1, multiSprintPlannedDeliveryOnTime: 1, multiSprintPlannedDeliveryNotDelivered: 1,
  },
  {
    name: 'Spint 4', sprintOnlyOnTime: 8, sprintOnlyDelayed: 0, sprintOnlyNotDelivered: 0,
    multiSprintPlannedDeliveryDelayed: 0, multiSprintPlannedDeliveryOnTime: 2, multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 5', sprintOnlyOnTime: 5, sprintOnlyDelayed: 3, sprintOnlyNotDelivered: 1,
    multiSprintPlannedDeliveryDelayed: 0, multiSprintPlannedDeliveryOnTime: 2, multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 6', sprintOnlyOnTime: 9, sprintOnlyDelayed: 1, sprintOnlyNotDelivered: 0,
    multiSprintPlannedDeliveryDelayed: 1, multiSprintPlannedDeliveryOnTime: 1, multiSprintPlannedDeliveryNotDelivered: 0,
  },
  {
    name: 'Spint 7', sprintOnlyOnTime: 6, sprintOnlyDelayed: 2, sprintOnlyNotDelivered: 1,
    multiSprintPlannedDeliveryDelayed: 0, multiSprintPlannedDeliveryOnTime: 2, multiSprintPlannedDeliveryNotDelivered: 0,
  },
  // A sprint atual não contribui para entregas "finalizadas" nos totalizadores gerais de "entregues"
  // mas seus projetos "novos" podem ser considerados para média por colaborador.
  {
    name: 'Sprint Atual',
    currentNewProjects: 7,
    currentInheritedDelayed: 3,
    currentMultiSprintNotPlannedDelivery: 2,
  },
];

// Supondo um número fixo de colaboradores para o cálculo da média
const totalCollaborators = ref(10); // Ajuste conforme o número real de colaboradores no time

// --- Computed Properties para os Totalizadores ---

const totalDeliveries = computed(() => {
  let total = 0;
  mockDataForTotalizers.forEach(sprint => {
    // Somas para sprints passadas
    total += (sprint.sprintOnlyOnTime || 0);
    total += (sprint.sprintOnlyDelayed || 0);
    total += (sprint.sprintOnlyNotDelivered || 0); // Projetos que eram para ser entregues mas não foram
    total += (sprint.multiSprintPlannedDeliveryDelayed || 0);
    total += (sprint.multiSprintPlannedDeliveryOnTime || 0);
    total += (sprint.multiSprintPlannedDeliveryNotDelivered || 0); // Projetos multi-sprint não entregues
    
    // Para a sprint atual, consideramos os projetos "novos" para o total de trabalho planejado/entregue
    // mas não para entregas "finalizadas" no passado
    total += (sprint.currentNewProjects || 0);
  });
  return total;
});

const totalOnTimeDeliveries = computed(() => {
  let total = 0;
  mockDataForTotalizers.forEach(sprint => {
    total += (sprint.sprintOnlyOnTime || 0);
    total += (sprint.multiSprintPlannedDeliveryOnTime || 0);
  });
  return total;
});

const totalLateDeliveries = computed(() => {
  let total = 0;
  mockDataForTotalizers.forEach(sprint => {
    total += (sprint.sprintOnlyDelayed || 0);
    total += (sprint.sprintOnlyNotDelivered || 0); // Considera não entregues como fora do prazo/falha
    total += (sprint.multiSprintPlannedDeliveryDelayed || 0);
    total += (sprint.multiSprintPlannedDeliveryNotDelivered || 0); // Considera multi-sprint não entregues como fora do prazo/falha
    total += (sprint.currentInheritedDelayed || 0); // Projetos já atrasados na sprint atual
  });
  return total;
});

const averageDeliveriesPerCollaborator = computed(() => {
  if (totalCollaborators.value === 0) return 0;
  // A média pode ser do total de entregas concluídas, ou do total de projetos trabalhados.
  // Vou considerar "totalDeliveries" que inclui tanto entregues quanto não entregues (trabalhados).
  return (totalDeliveries.value / totalCollaborators.value).toFixed(1); // Arredonda para 1 casa decimal
});

</script>

<template>
  <v-container fluid>
    <h2 class="mb-3">Painel do Time: <span style="font-weight: 500;">TechFin</span></h2>

    <v-row dense class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="blue darken-2">mdi-chart-bar</v-icon> <div class="text-h6 mt-2">Entregas totais</div>
          <div class="text-h5 font-weight-bold">{{ totalDeliveries }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="green darken-2">mdi-check-circle-outline</v-icon> <div class="text-h6 mt-2">Entregas no prazo</div>
          <div class="text-h5 font-weight-bold">{{ totalOnTimeDeliveries }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="red darken-2">mdi-close-circle-outline</v-icon> <div class="text-h6 mt-2">Entregas fora do prazo</div>
          <div class="text-h5 font-weight-bold">{{ totalLateDeliveries }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <v-icon size="32" color="orange darken-2">mdi-account-multiple-outline</v-icon> <div class="text-h6 mt-2">Média por membro</div>
          <div class="text-h5 font-weight-bold">{{ averageDeliveriesPerCollaborator }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <SprintEvolutionChart />
      </v-col>
    </v-row>
  </v-container>
</template>
