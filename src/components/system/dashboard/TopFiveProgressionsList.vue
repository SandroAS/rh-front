<script setup lang="ts">
import { ref, computed } from 'vue'

// Define uma interface para o histórico de progressão
interface ProgressaoRecord {
  ano: number;
  mes: number;
  progressaoMedia: number; // Porcentagem de progressão naquele ponto
}

// Define uma interface para o colaborador
interface Colaborador {
  id: number;
  nome: string;
  sobrenome: string;
  historicoProgressao: ProgressaoRecord[];
}

// --- DADOS MOCKADOS: Colaboradores com Histórico de Progressão de Carreira ---
const colaboradores = ref<Colaborador[]>([
  {
    id: 1,
    nome: 'Ana',
    sobrenome: 'Silva',
    historicoProgressao: [
      { ano: 2024, mes: 1, progressaoMedia: 50.0 },
      { ano: 2024, mes: 3, progressaoMedia: 55.0 },
      { ano: 2024, mes: 7, progressaoMedia: 60.0 },
      { ano: 2025, mes: 1, progressaoMedia: 65.0 },
      { ano: 2025, mes: 7, progressaoMedia: 75.0 } // Última: 75.0, Primeira: 50.0, Crescimento: 25.0
    ]
  },
  {
    id: 2,
    nome: 'Bruno',
    sobrenome: 'Martins',
    historicoProgressao: [
      { ano: 2024, mes: 5, progressaoMedia: 40.0 },
      { ano: 2024, mes: 11, progressaoMedia: 45.0 },
      { ano: 2025, mes: 7, progressaoMedia: 70.0 } // Última: 70.0, Primeira: 40.0, Crescimento: 30.0
    ]
  },
  {
    id: 3,
    nome: 'Carla',
    sobrenome: 'Pereira',
    historicoProgressao: [
      { ano: 2023, mes: 10, progressaoMedia: 60.0 },
      { ano: 2024, mes: 3, progressaoMedia: 62.0 },
      { ano: 2025, mes: 7, progressaoMedia: 68.0 } // Última: 68.0, Primeira: 60.0, Crescimento: 8.0
    ]
  },
  {
    id: 4,
    nome: 'Daniel',
    sobrenome: 'Costa',
    historicoProgressao: [
      { ano: 2025, mes: 1, progressaoMedia: 30.0 },
      { ano: 2025, mes: 7, progressaoMedia: 60.0 } // Última: 60.0, Primeira: 30.0, Crescimento: 30.0
    ]
  },
  {
    id: 5,
    nome: 'Eliane',
    sobrenome: 'Gomes',
    historicoProgressao: [
      { ano: 2024, mes: 2, progressaoMedia: 25.0 },
      { ano: 2025, mes: 7, progressaoMedia: 58.0 } // Última: 58.0, Primeira: 25.0, Crescimento: 33.0
    ]
  },
  {
    id: 6,
    nome: 'Fábio',
    sobrenome: 'Almeida',
    historicoProgressao: [
      { ano: 2025, mes: 3, progressaoMedia: 50.0 },
      { ano: 2025, mes: 7, progressaoMedia: 70.0 } // Última: 70.0, Primeira: 50.0, Crescimento: 20.0
    ]
  },
  {
    id: 7,
    nome: 'Gisele',
    sobrenome: 'Nunes',
    historicoProgressao: [
      { ano: 2025, mes: 6, progressaoMedia: 45.0 },
      { ano: 2025, mes: 7, progressaoMedia: 55.0 } // Última: 55.0, Primeira: 45.0, Crescimento: 10.0
    ]
  },
  {
    id: 8,
    nome: 'Heloísa',
    sobrenome: 'Rocha',
    historicoProgressao: [
      { ano: 2025, mes: 7, progressaoMedia: 80.0 } // Apenas um registro, crescimento 0
    ]
  },
  {
    id: 9,
    nome: 'Igor',
    sobrenome: 'Souza',
    historicoProgressao: [] // Sem registros, crescimento 0
  },
])

// Helper para ordenar o histórico de progressão por data
const sortByDate = (a: ProgressaoRecord, b: ProgressaoRecord) => {
  const dateA = new Date(a.ano, a.mes - 1);
  const dateB = new Date(b.ano, b.mes - 1);
  return dateA.getTime() - dateB.getTime();
};

// --- Lógica para os Top 5 Colaboradores com Maior Crescimento ---
const topCrescimentoColaboradores = computed(() => {
  const colaboradoresComCrescimento: {
    colaborador: Colaborador;
    crescimentoPercentual: number;
    progressaoAtual: number; // Para exibir a porcentagem atual
  }[] = [];

  colaboradores.value.forEach(colaborador => {
    // Garante que haja pelo menos dois registros para calcular crescimento
    if (colaborador.historicoProgressao && colaborador.historicoProgressao.length >= 2) {
      // Ordena o histórico para garantir que o primeiro e o último são os corretos
      const historicoOrdenado = [...colaborador.historicoProgressao].sort(sortByDate);

      const primeiraProgressao = historicoOrdenado[0].progressaoMedia;
      const ultimaProgressao = historicoOrdenado[historicoOrdenado.length - 1].progressaoMedia;

      const crescimento = ultimaProgressao - primeiraProgressao;

      colaboradoresComCrescimento.push({
        colaborador: colaborador,
        crescimentoPercentual: crescimento,
        progressaoAtual: ultimaProgressao, // A porcentagem mais recente
      });
    }
  });

  // Ordena os colaboradores pelo crescimento percentual (do maior para o menor)
  colaboradoresComCrescimento.sort((a, b) => b.crescimentoPercentual - a.crescimentoPercentual);

  // Retorna apenas os top 5
  return colaboradoresComCrescimento.slice(0, 5);
});

// Funções utilitárias (mantidas)
function getIniciais(nome: string, sobrenome: string) {
  return `${nome[0]}${sobrenome[0]}`.toUpperCase()
}

// A função formatarData pode ser removida se não for usada,
// mas vou mantê-la caso haja necessidade futura de exibir datas do histórico.
// function formatarData(data: string) {
//   const d = new Date(data)
//   return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
// }
</script>

<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 font-weight-bold">Top 5 Crescimento de Carreira</v-card-title>
    <v-divider class="mb-2"></v-divider>

    <v-list density="comfortable">
      <v-list-item
        v-for="(item, index) in topCrescimentoColaboradores"
        :key="item.colaborador.id"
      >
        <template #prepend>
          <v-avatar color="primary" size="40">
            <span class="text-white text-subtitle-2">
              {{ getIniciais(item.colaborador.nome, item.colaborador.sobrenome) }}
            </span>
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-medium">
          {{ item.colaborador.nome }} {{ item.colaborador.sobrenome }}
        </v-list-item-title>
        <div class="colaborador-detalhes">
          <div>Progressão Atual: {{ item.progressaoAtual.toFixed(1) }}%</div>
        </div>

        <template #append>
          <div class="growth-info">
            <v-chip
              :color="item.crescimentoPercentual >= 0 ? 'green' : 'red'"
              variant="tonal"
              size="small"
            >
              <v-icon
                start
                :icon="item.crescimentoPercentual >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
              ></v-icon>
              {{ item.crescimentoPercentual.toFixed(1) }}%
            </v-chip>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="topCrescimentoColaboradores.length === 0" class="text-center text-body-2 mt-4">
      Nenhum colaborador com crescimento registrado até o momento.
    </div>
  </v-card>
</template>

<style scoped>
.colaborador-detalhes {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
  margin-top: 2px;
  white-space: normal;
  overflow: visible;
}

.growth-info {
  display: flex;
  align-items: center;
}
</style>