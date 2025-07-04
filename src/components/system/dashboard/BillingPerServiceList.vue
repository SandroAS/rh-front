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

const todosServicosPrestados = [
  { nome: 'Consulta', quantidade: 30, faturamento: 4500, ano: 2025, mes: 5 },
  { nome: 'Limpeza', quantidade: 20, faturamento: 2000, ano: 2025, mes: 5 },
  { nome: 'Extração', quantidade: 15, faturamento: 2250, ano: 2025, mes: 5 },
  { nome: 'Consulta', quantidade: 90, faturamento: 13500, ano: 2025, mes: 4 },
  { nome: 'Canal', quantidade: 30, faturamento: 10500, ano: 2025, mes: 4 },
  { nome: 'Clareamento', quantidade: 20, faturamento: 6000, ano: 2025, mes: 3 },
]

const servicosFiltrados = computed(() => {
  const filtrados = todosServicosPrestados.filter(s => {
    const anoOk = filtroAno.value ? s.ano === filtroAno.value : true
    const mesOk = filtroMes.value ? s.mes === filtroMes.value : true
    return anoOk && mesOk
  })

  const agrupados: Record<string, { nome: string; quantidade: number; faturamento: number }> = {}

  filtrados.forEach(s => {
    if (!agrupados[s.nome]) {
      agrupados[s.nome] = { nome: s.nome, quantidade: 0, faturamento: 0 }
    }
    agrupados[s.nome].quantidade += s.quantidade
    agrupados[s.nome].faturamento += s.faturamento
  })

  return Object.values(agrupados).sort((a, b) => b.faturamento - a.faturamento)
})
</script>

<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 font-weight-bold">Serviços Prestados</v-card-title>
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
          <th>Serviço</th>
          <th class="text-center">Quantidade</th>
          <th class="text-right">Faturamento</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="servico in servicosFiltrados" :key="servico.nome">
          <td>{{ servico.nome }}</td>
          <td class="text-center">{{ servico.quantidade }}</td>
          <td class="text-right">R$ {{ servico.faturamento.toLocaleString() }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>