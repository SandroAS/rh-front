<script setup lang="ts">
import { ref, computed } from 'vue'

interface AvaliacaoPendente {
  idAvaliacao: number;
  tipoAvaliacao: string;
  dataVencimento: string;
  status: 'Pendente';
}

interface ColaboradorComAvaliacoes {
  id: number;
  nome: string;
  sobrenome: string;
  telefone: string;
  email: string;
  avaliacoesPendentes: AvaliacaoPendente[];
}

const todosColaboradoresComAvaliacoes = ref<ColaboradorComAvaliacoes[]>([
  {
    id: 101,
    nome: 'Beatriz', // Reordenado para ficar mais próximo do print
    sobrenome: 'Costa',
    telefone: '(11) 93333-3333',
    email: 'beatriz.c@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 4, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-09-01', status: 'Pendente' },
      { idAvaliacao: 5, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-09-10', status: 'Pendente' },
      { idAvaliacao: 6, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-10-05', status: 'Pendente' },
    ],
  },
  {
    id: 102,
    nome: 'Maria', // Reordenado para ficar mais próximo do print
    sobrenome: 'Oliveira',
    telefone: '(11) 91111-1111',
    email: 'maria.o@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 1, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-07-31', status: 'Pendente' },
      { idAvaliacao: 2, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-08-15', status: 'Pendente' },
    ],
  },
  {
    id: 103,
    nome: 'João', // Reordenado para ficar mais próximo do print
    sobrenome: 'Silva',
    telefone: '(11) 92222-2222',
    email: 'joao.s@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 3, tipoAvaliacao: 'Desenvolvimento', dataVencimento: '2025-07-20', status: 'Pendente' },
    ],
  },
  {
    id: 104,
    nome: 'Pedro',
    sobrenome: 'Souza',
    telefone: '(11) 94444-4444',
    email: 'pedro.s@empresa.com',
    avaliacoesPendentes: [], // Sem avaliações pendentes
  },
  {
    id: 102,
    nome: 'Maria', // Reordenado para ficar mais próximo do print
    sobrenome: 'Oliveira',
    telefone: '(11) 91111-1111',
    email: 'maria.o@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 1, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-07-31', status: 'Pendente' },
      { idAvaliacao: 2, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-08-15', status: 'Pendente' },
    ],
  },
  {
    id: 103,
    nome: 'João', // Reordenado para ficar mais próximo do print
    sobrenome: 'Silva',
    telefone: '(11) 92222-2222',
    email: 'joao.s@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 3, tipoAvaliacao: 'Desenvolvimento', dataVencimento: '2025-07-20', status: 'Pendente' },
    ],
  },
  {
    id: 104,
    nome: 'Pedro',
    sobrenome: 'Souza',
    telefone: '(11) 94444-4444',
    email: 'pedro.s@empresa.com',
    avaliacoesPendentes: [], // Sem avaliações pendentes
  },
  {
    id: 102,
    nome: 'Maria', // Reordenado para ficar mais próximo do print
    sobrenome: 'Oliveira',
    telefone: '(11) 91111-1111',
    email: 'maria.o@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 1, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-07-31', status: 'Pendente' },
      { idAvaliacao: 2, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-08-15', status: 'Pendente' },
    ],
  },
  {
    id: 103,
    nome: 'João', // Reordenado para ficar mais próximo do print
    sobrenome: 'Silva',
    telefone: '(11) 92222-2222',
    email: 'joao.s@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 3, tipoAvaliacao: 'Desenvolvimento', dataVencimento: '2025-07-20', status: 'Pendente' },
    ],
  },
  {
    id: 104,
    nome: 'Pedro',
    sobrenome: 'Souza',
    telefone: '(11) 94444-4444',
    email: 'pedro.s@empresa.com',
    avaliacoesPendentes: [], // Sem avaliações pendentes
  },
  {
    id: 102,
    nome: 'Maria', // Reordenado para ficar mais próximo do print
    sobrenome: 'Oliveira',
    telefone: '(11) 91111-1111',
    email: 'maria.o@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 1, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-07-31', status: 'Pendente' },
      { idAvaliacao: 2, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-08-15', status: 'Pendente' },
    ],
  },
  {
    id: 103,
    nome: 'João', // Reordenado para ficar mais próximo do print
    sobrenome: 'Silva',
    telefone: '(11) 92222-2222',
    email: 'joao.s@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 3, tipoAvaliacao: 'Desenvolvimento', dataVencimento: '2025-07-20', status: 'Pendente' },
    ],
  },
  {
    id: 104,
    nome: 'Pedro',
    sobrenome: 'Souza',
    telefone: '(11) 94444-4444',
    email: 'pedro.s@empresa.com',
    avaliacoesPendentes: [], // Sem avaliações pendentes
  },
  {
    id: 102,
    nome: 'Maria', // Reordenado para ficar mais próximo do print
    sobrenome: 'Oliveira',
    telefone: '(11) 91111-1111',
    email: 'maria.o@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 1, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-07-31', status: 'Pendente' },
      { idAvaliacao: 2, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-08-15', status: 'Pendente' },
    ],
  },
  {
    id: 103,
    nome: 'João', // Reordenado para ficar mais próximo do print
    sobrenome: 'Silva',
    telefone: '(11) 92222-2222',
    email: 'joao.s@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 3, tipoAvaliacao: 'Desenvolvimento', dataVencimento: '2025-07-20', status: 'Pendente' },
    ],
  },
  {
    id: 104,
    nome: 'Pedro',
    sobrenome: 'Souza',
    telefone: '(11) 94444-4444',
    email: 'pedro.s@empresa.com',
    avaliacoesPendentes: [], // Sem avaliações pendentes
  },
  {
    id: 102,
    nome: 'Maria', // Reordenado para ficar mais próximo do print
    sobrenome: 'Oliveira',
    telefone: '(11) 91111-1111',
    email: 'maria.o@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 1, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-07-31', status: 'Pendente' },
      { idAvaliacao: 2, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-08-15', status: 'Pendente' },
    ],
  },
  {
    id: 103,
    nome: 'João', // Reordenado para ficar mais próximo do print
    sobrenome: 'Silva',
    telefone: '(11) 92222-2222',
    email: 'joao.s@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 3, tipoAvaliacao: 'Desenvolvimento', dataVencimento: '2025-07-20', status: 'Pendente' },
    ],
  },
  {
    id: 104,
    nome: 'Pedro',
    sobrenome: 'Souza',
    telefone: '(11) 94444-4444',
    email: 'pedro.s@empresa.com',
    avaliacoesPendentes: [], // Sem avaliações pendentes
  },
  {
    id: 102,
    nome: 'Maria', // Reordenado para ficar mais próximo do print
    sobrenome: 'Oliveira',
    telefone: '(11) 91111-1111',
    email: 'maria.o@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 1, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-07-31', status: 'Pendente' },
      { idAvaliacao: 2, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-08-15', status: 'Pendente' },
    ],
  },
  {
    id: 103,
    nome: 'João', // Reordenado para ficar mais próximo do print
    sobrenome: 'Silva',
    telefone: '(11) 92222-2222',
    email: 'joao.s@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 3, tipoAvaliacao: 'Desenvolvimento', dataVencimento: '2025-07-20', status: 'Pendente' },
    ],
  },
  {
    id: 104,
    nome: 'Pedro',
    sobrenome: 'Souza',
    telefone: '(11) 94444-4444',
    email: 'pedro.s@empresa.com',
    avaliacoesPendentes: [], // Sem avaliações pendentes
  },
  {
    id: 102,
    nome: 'Maria', // Reordenado para ficar mais próximo do print
    sobrenome: 'Oliveira',
    telefone: '(11) 91111-1111',
    email: 'maria.o@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 1, tipoAvaliacao: 'Performance Anual', dataVencimento: '2025-07-31', status: 'Pendente' },
      { idAvaliacao: 2, tipoAvaliacao: 'Feedback 360', dataVencimento: '2025-08-15', status: 'Pendente' },
    ],
  },
  {
    id: 103,
    nome: 'João', // Reordenado para ficar mais próximo do print
    sobrenome: 'Silva',
    telefone: '(11) 92222-2222',
    email: 'joao.s@empresa.com',
    avaliacoesPendentes: [
      { idAvaliacao: 3, tipoAvaliacao: 'Desenvolvimento', dataVencimento: '2025-07-20', status: 'Pendente' },
    ],
  },
  {
    id: 104,
    nome: 'Pedro',
    sobrenome: 'Souza',
    telefone: '(11) 94444-4444',
    email: 'pedro.s@empresa.com',
    avaliacoesPendentes: [], // Sem avaliações pendentes
  },
]);

const colaboradoresComPendenciasAgrupadas = computed(() => {
  const listaAgrupada: {
    colaborador: ColaboradorComAvaliacoes;
    quantidadePendentes: number;
  }[] = [];

  todosColaboradoresComAvaliacoes.value.forEach(colaborador => {
    const pendentes = colaborador.avaliacoesPendentes.filter(av => av.status === 'Pendente');
    if (pendentes.length > 0) {
      listaAgrupada.push({
        colaborador: colaborador,
        quantidadePendentes: pendentes.length,
      });
    }
  });
  
  // Opcional: ordenar por quantidade de pendências (maior para menor)
  listaAgrupada.sort((a, b) => b.quantidadePendentes - a.quantidadePendentes);

  return listaAgrupada;
});

function getIniciais(nome: string, sobrenome: string) {
  return `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase()
}

function redirectToAvaliacoes(colaboradorId: number) {
  console.log(`Redirecionando para a tela de avaliações do colaborador ID: ${colaboradorId}`);
  // Implemente sua lógica de roteamento real aqui (ex: router.push(...))
  alert(`Redirecionando para as avaliações de: ${colaboradorId}`);
}
</script>

<template>
  <v-card class="pa-4 mb-6" elevation="2" max-height="565" style="overflow: auto;">
    <v-card-title class="text-h6 font-weight-bold">Avaliações Pendentes</v-card-title>
    <v-divider class="mb-2" />
    <v-list density="comfortable"> <v-list-item
        v-for="item in colaboradoresComPendenciasAgrupadas"
        :key="item.colaborador.id"
        class="py-0" >
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
        <div class="colaborador-detalhes text-caption">
          <div>{{ item.colaborador.email }}</div>
        </div>

        <template #append>
          <div class="d-flex flex-column align-center">
            <v-chip
              color="warning"
              variant="tonal"
              size="x-small"
              class="pr-0"
            >
              {{ item.quantidadePendentes }} pendente<span v-if="item.quantidadePendentes > 1">s</span>
              <v-btn
                title="Ver Avaliações"
                icon="mdi-arrow-top-right"
                color="primary"
                size="small"
                density="compact"
                class="ml-1"
                @click="redirectToAvaliacoes(item.colaborador.id)"
              ></v-btn>
            </v-chip>
            
          </div>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="colaboradoresComPendenciasAgrupadas.length === 0" class="text-center text-body-2 mt-4">
      Nenhum colaborador com avaliações pendentes.
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
</style>
