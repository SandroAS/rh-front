<script setup lang="ts">
import { ref, computed } from 'vue'

const filtroAno = ref<number | null>(null)
const filtroMes = ref<number | null>(null)

const meses = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 },
]

const anosDisponiveis = [2023, 2024, 2025] 

// --- NOVOS DADOS MOCKADOS: Mais variados para testar a lógica do "último no período" ---
// É crucial que esses dados estejam *ordenados para facilitar a lógica de "anterior"* se não usarmos o mapa
const dadosProgressaoCarreira = [
  // Engenharia Backend
  { team: 'Engenharia Backend', progressaoMedia: 60.0, ano: 2024, mes: 12 },
  { team: 'Engenharia Backend', progressaoMedia: 78.0, ano: 2025, mes: 5 },
  { team: 'Engenharia Backend', progressaoMedia: 82.0, ano: 2025, mes: 6 },
  { team: 'Engenharia Backend', progressaoMedia: 85.2, ano: 2025, mes: 7 }, 

  // Design UX/UI
  { team: 'Design UX/UI', progressaoMedia: 65.0, ano: 2024, mes: 12 },
  { team: 'Design UX/UI', progressaoMedia: 87.0, ano: 2025, mes: 5 },
  { team: 'Design UX/UI', progressaoMedia: 89.0, ano: 2025, mes: 6 }, 

  // Marketing Digital
  { team: 'Marketing Digital', progressaoMedia: 62.0, ano: 2025, mes: 4 },
  { team: 'Marketing Digital', progressaoMedia: 65.0, ano: 2025, mes: 5 }, 
  { team: 'Marketing Digital', progressaoMedia: 70.3, ano: 2025, mes: 7 }, // Pulou Junho

  // Vendas Corporativas
  { team: 'Vendas Corporativas', progressaoMedia: 63.0, ano: 2025, mes: 6 },
  { team: 'Vendas Corporativas', progressaoMedia: 65.8, ano: 2025, mes: 7 },

  // Suporte ao Cliente (dados apenas de meses anteriores ou ano anterior)
  { team: 'Suporte ao Cliente', progressaoMedia: 80.0, ano: 2024, mes: 11 },
  { team: 'Suporte ao Cliente', progressaoMedia: 85.0, ano: 2025, mes: 4 },
  { team: 'Suporte ao Cliente', progressaoMedia: 88.0, ano: 2025, mes: 5 }, 

  // Recursos Humanos (dados esporádicos)
  { team: 'Recursos Humanos', progressaoMedia: 80.0, ano: 2024, mes: 9 },
  { team: 'Recursos Humanos', progressaoMedia: 90.0, ano: 2025, mes: 1 },
  { team: 'Recursos Humanos', progressaoMedia: 95.5, ano: 2025, mes: 7 }, 

  // Inovação (dados apenas de 2024)
  { team: 'Inovação', progressaoMedia: 48.0, ano: 2024, mes: 10 },
  { team: 'Inovação', progressaoMedia: 45.0, ano: 2024, mes: 11 },
];

// Helper para converter ano/mes em uma data para fácil comparação
const createDateFromYyyyMm = (ano: number, mes: number) => new Date(ano, mes - 1, 1);

// --- LÓGICA DE FILTRAGEM E AGRUPAÇÃO AVANÇADA COM COMPARAÇÃO ---
const progressaoPorTimeFiltrada = computed(() => {
  const latestProgressions: Record<string, {
    team: string;
    progressaoMedia: number;
    ano: number;
    mes: number;
    color: string; // Adiciona a propriedade de cor
  }> = {}

  // 1. Prepara um mapa com o histórico ordenado por time
  // Map<teamName, Array<ItemOrdenadoPorData>>
  const historicalDataGroupedAndSorted = new Map<string, typeof dadosProgressaoCarreira[number][]>();
  dadosProgressaoCarreira.forEach(dado => {
    if (!historicalDataGroupedAndSorted.has(dado.team)) {
      historicalDataGroupedAndSorted.set(dado.team, []);
    }
    historicalDataGroupedAndSorted.get(dado.team)?.push(dado);
  });

  // Ordena cada histórico de time cronologicamente
  historicalDataGroupedAndSorted.forEach(teamHistory => {
    teamHistory.sort((a, b) => {
      const dateA = createDateFromYyyyMm(a.ano, a.mes);
      const dateB = createDateFromYyyyMm(b.ano, b.mes);
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Determine a data limite para o filtro (fim do mês/ano selecionado)
  let filterDateLimit: Date | null = null;
  if (filtroAno.value && filtroMes.value) {
    filterDateLimit = new Date(filtroAno.value, filtroMes.value, 0); // O dia 0 do próximo mês é o último dia do mês atual
  } else if (filtroAno.value) {
    filterDateLimit = new Date(filtroAno.value, 12, 0); // Fim de dezembro do ano selecionado
  }
  // Se nenhum filtro, filterDateLimit permanece null, sem limite superior

  // 2. Para cada time, encontrar a última progressão no período E a progressão anterior
  historicalDataGroupedAndSorted.forEach((teamHistory, teamName) => {
    let latestProgressionForPeriod: typeof dadosProgressaoCarreira[number] | null = null;
    let previousProgressionForPeriod: typeof dadosProgressaoCarreira[number] | null = null;

    // Itera do mais recente para o mais antigo para encontrar o "latest" e "previous"
    for (let i = teamHistory.length - 1; i >= 0; i--) {
      const currentItem = teamHistory[i];
      const itemDate = createDateFromYyyyMm(currentItem.ano, currentItem.mes);

      // Se há um limite de filtro e o item está fora desse limite, pule
      if (filterDateLimit && itemDate > filterDateLimit) {
        continue;
      }

      // Se ainda não encontrou o item mais recente para o período
      if (!latestProgressionForPeriod) {
        latestProgressionForPeriod = currentItem;
      } else {
        // Este item é anterior ao item mais recente já encontrado
        previousProgressionForPeriod = currentItem;
        break; // Encontrou o par (latest e previous), pode parar a iteração
      }
    }

    if (latestProgressionForPeriod) {
      let color = 'green'; // Padrão: verde (sem registro anterior ou progressão maior/igual)

      if (previousProgressionForPeriod) {
        if (latestProgressionForPeriod.progressaoMedia < previousProgressionForPeriod.progressaoMedia) {
          color = 'red'; // Diminuiu
        } else {
          color = 'green'; // Aumentou ou permaneceu igual
        }
      }
      
      latestProgressions[teamName] = { ...latestProgressionForPeriod, color };
    }
  });

  // 3. Converte o objeto de resultados em um array e ordena
  const resultado = Object.values(latestProgressions);

  // Ordena por progressão média (descendente)
  return resultado.sort((a, b) => b.progressaoMedia - a.progressaoMedia);
});
</script>

<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 font-weight-bold">Progressão por Time</v-card-title>
    <v-divider class="mb-2" />
    <div class="mb-4">
      <div class="d-flex gap-2 align-center">
        <v-select
          v-model="filtroMes"
          :items="meses"
          item-title="label"
          item-value="value"
          label="Mês"
          clearable
          density="compact"
          hide-details
          class="mr-2"
        />
        <v-select
          v-model="filtroAno"
          :items="anosDisponiveis"
          label="Ano"
          clearable
          density="compact"
          hide-details
        />
      </div>
    </div>

    <v-table>
      <thead>
        <tr>
          <th>Time</th>
          <th class="text-right">Progressão Média (%)</th>
          <th class="text-right">Data do Registro</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dado in progressaoPorTimeFiltrada" :key="dado.team">
          <td>{{ dado.team }}</td>
          <td class="text-right">
            <v-chip
              :color="dado.color"
              variant="tonal"
            >
              {{ dado.progressaoMedia.toFixed(1) }}%
            </v-chip>
          </td>
          <td class="text-right">
            {{ createDateFromYyyyMm(dado.ano, dado.mes).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '/') }}
          </td>
        </tr>
        <tr v-if="progressaoPorTimeFiltrada.length === 0">
          <td colspan="3" class="text-center text-medium-emphasis">Nenhum dado encontrado para o período ou filtros selecionados.</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<style scoped>
.d-flex.gap-2 {
  gap: 16px;
}
</style>