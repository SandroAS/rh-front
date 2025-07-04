<script setup lang="ts">
import { ref } from 'vue'

interface PacienteComPagamentoPendente {
  id: number
  nome: string
  sobrenome: string
  telefone: string
  email: string
  servico: string
  valor: number
  dataServico: string // formato ISO: "2025-05-03"
}

const pacientesComPagamento = ref<PacienteComPagamentoPendente[]>([
  {
    id: 1,
    nome: 'Ana',
    sobrenome: 'Silva',
    telefone: '(11) 99999-1111',
    email: 'ana.silva@email.com',
    servico: 'Limpeza',
    valor: 180.0,
    dataServico: '2025-05-03',
  },
  {
    id: 2,
    nome: 'Carlos',
    sobrenome: 'Pereira',
    telefone: '(11) 98888-2222',
    email: 'carlos.pereira@email.com',
    servico: 'Canal',
    valor: 850.0,
    dataServico: '2025-04-28',
  },
])

function getIniciais(nome: string, sobrenome: string) {
  return `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase()
}

function formatarData(data: string) {
  const d = new Date(data)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <v-card class="pa-4 mb-6" elevation="2">
    <v-card-title class="text-h6 font-weight-bold">Pagamentos Pendentes</v-card-title>
    <v-divider class="mb-2" />
    <v-list>
      <v-list-item
        v-for="paciente in pacientesComPagamento"
        :key="paciente.id"
        class="py-2"
      >
        <template #prepend>
          <v-avatar color="primary" class="me-3">
            {{ getIniciais(paciente.nome, paciente.sobrenome) }}
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-medium">
          {{ paciente.nome }} {{ paciente.sobrenome }}
        </v-list-item-title>

        <div class="paciente-detalhes">
          <div>{{ paciente.telefone }}</div>
          <div>{{ paciente.email }}</div>
        </div>

        <template #append>
          <div class="pagamento-info">
            <div class="text-body-2 font-weight-medium text-primary">
              {{ paciente.servico }} <br> {{ formatarValor(paciente.valor) }}
            </div>
            <div class="text-caption">{{ formatarData(paciente.dataServico) }}</div>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style scoped>
.paciente-detalhes {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
  margin-top: 2px;
  white-space: normal;
  overflow: visible;
}

.pagamento-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  text-align: right;
  height: 100%;
}
</style>
