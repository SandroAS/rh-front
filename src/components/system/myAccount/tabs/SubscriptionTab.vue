<script setup>
import { ref } from 'vue'
import dayjs from '@/plugins/dayjs.ts'

const estadoAssinatura = ref('ativo') // 'trial' | 'semPlano' | 'ativo'

// Mock: dados de trial
const planoTrial = {
  inicio: '05/05/2025',
  fim: '12/05/2025'
}

// Mock: plano ativo
const planoAtivo = {
  nome: 'Plano Multi',
  inicio: '01/05/2025',
  fim: '01/06/2025'
}

// Mock headers da tabela
const headers = [
  { text: 'Parcela', value: 'parcela' },
  { text: 'Data de Pagamento / Prevista', value: 'data' },
  { text: 'Status', value: 'status' },
  { text: 'Ação', value: 'acao', sortable: false }
]

// Mock dos pagamentos
const pagamentos = ref([
  {
    parcela: '1ª parcela',
    data: '01/02/2025',
    status: 'Pago',
    statusColor: 'green',
    pago: true
  },
  {
    parcela: '2ª parcela',
    data: '01/03/2025',
    status: 'Pago',
    statusColor: 'green',
    pago: true
  },
  {
    parcela: '3ª parcela',
    data: '01/04/2025',
    status: 'Em atraso',
    statusColor: 'red',
    pago: false
  },
  {
    parcela: '4ª parcela',
    data: '01/05/2025',
    status: 'Pendente',
    statusColor: 'grey',
    pago: false
  }
])

const gerarPix = (parcela) => {
  console.log('Gerar PIX para:', parcela.parcela)
  // Aqui você pode abrir um diálogo ou chamar uma função real futuramente
}

// Atualiza dinamicamente os status com base na data atual
pagamentos.value = pagamentos.value.map((p) => {
  const hoje = dayjs()
  const dataParcela = dayjs(p.data, 'DD/MM/YYYY')

  if (p.pago) {
    return p
  }

  if (p.status == 'Pendente') {
    return p
  }

  const diasAtraso = hoje.diff(dataParcela, 'day')

  if (diasAtraso > 0) {
    return {
      ...p,
      status: `Em atraso (${diasAtraso} dias)`,
      statusColor: 'red'
    }
  }

  return {
    ...p,
    status: 'Pendente',
    statusColor: 'grey'
  }
})
</script>

<template>
  <div>
    <v-select
      v-model="estadoAssinatura"
      :items="['trial', 'semPlano', 'ativo']"
      label="Simular estado da assinatura"
      class="mb-6"
    />

    <!-- TRIAL -->
    <div v-if="estadoAssinatura === 'trial'">
      <v-alert type="info" border="start" elevation="2" class="mb-4">
        <strong>Você está em período de avaliação gratuita (Trial)</strong><br>
        Início: {{ planoTrial.inicio }}<br>
        Fim: {{ planoTrial.fim }}
      </v-alert>
    </div>

    <!-- SEM PLANO -->
    <div v-if="estadoAssinatura === 'semPlano'">
      <v-alert type="warning" border="start" elevation="2" class="mb-4">
        <strong>Você ainda não assinou nenhum plano.</strong><br>
        Escolha uma das opções abaixo para continuar utilizando o sistema após o período de teste.
      </v-alert>

      <v-row class="pa-2">
        <v-col cols="12" md="6">
          <v-card elevation="3" class="pa-4">
            <v-card-title class="text-h6">Plano Solo</v-card-title>
            <v-card-subtitle class="text-caption">R$ 200/mês</v-card-subtitle>
            <v-card-text>
              <ul class="text-sm">
                <li>✔ Todas as funcionalidades</li>
                <li>✔ 1 usuário (profissional de saúde)</li>
              </ul>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block>Assinar Solo</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="3" class="pa-4">
            <v-card-title class="text-h6">Plano Multi</v-card-title>
            <v-card-subtitle class="text-caption">R$ 200/mês + R$ 180 por profissional adicional</v-card-subtitle>
            <v-card-text>
              <ul class="text-sm">
                <li>✔ Todas as funcionalidades</li>
                <li>✔ Ideal para clínicas com vários profissionais</li>
              </ul>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block>Assinar Multi</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- PLANO ATIVO -->
    <div v-if="estadoAssinatura === 'ativo'">
      <v-alert type="success" border="start" elevation="2" class="mb-4">
        <strong>Plano Ativo: {{ planoAtivo.nome }}</strong><br>
        Início: {{ planoAtivo.inicio }}<br>
        Próxima renovação: {{ planoAtivo.fim }}
      </v-alert>

      <v-card class="mt-4">
        <v-card-title>Histórico de Pagamentos</v-card-title>
        <v-data-table
          :headers="headers"
          :items="pagamentos"
          class="elevation-1"
        >
        <template #item.status="{ item }">
          <v-chip
            :color="item.statusColor"
            text-color="white"
            small
          >
            <template v-if="item.status === 'Em atraso'">
              {{ item.status }} ({{ dayjs().diff(dayjs(item.data, 'DD/MM/YYYY'), 'day') }} dias)
            </template>
            <template v-else>
              {{ item.status }}
            </template>
          </v-chip>
        </template>

          <template #item.acao="{ item }">
            <v-btn
              v-if="!item.pago"
              color="primary"
              size="small"
              @click="gerarPix(item)"
            >
              Gerar PIX
            </v-btn>
            <span v-else>—</span>
          </template>
        </v-data-table>
      </v-card>

    </div>
  </div>
</template>
